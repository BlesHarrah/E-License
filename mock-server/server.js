const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const SECRET = process.env.MOSIP_SECRET || 'dev_mosip_secret';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadUsersFromFile() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    return new Map(arr.map(u => [u.username, u]));
  } catch (err) {
    return new Map();
  }
}

function saveUsersToFile(map) {
  const arr = Array.from(map.values());
  fs.writeFileSync(USERS_FILE, JSON.stringify(arr, null, 2));
}

const users = loadUsersFromFile();

// seed admin on first run
if (!Array.from(users.values()).some(u => u.username === 'IDADMIN')) {
  const admin = {
    fullname: 'Victor Magreta',
    firstName: 'Victor',
    lastName: 'Magreta',
    email: 'victormagreta.90@gmail.com',
    username: 'IDADMIN',
    passwordHash: crypto.createHash('sha256').update('admin123').digest('hex'),
    role: 'admin'
  };
  users.set(admin.username, admin);
  saveUsersToFile(users);
  console.log('Seeded admin user: IDADMIN / admin123');
}

// OTP & temp tokens
const otps = new Map(); // key -> { code, expiresAt }
const loginTokens = new Map(); // token -> username

function generateMosipId() {
  // simple mock MOSIP ID: MOSIP + 12-digit number
  const num = Math.floor(Math.random() * 1e12).toString().padStart(12, '0');
  return `MOSIP${num}`;
}

app.get('/', (req, res) => {
  res.json({ service: 'mock-mosip', status: 'ok', docs: '/docs (not implemented)' });
});

function sendEmail(to, subject, body) {
  // simulate email by appending to a log file
  const line = `[${new Date().toISOString()}] To: ${to} | ${subject} | ${body}\n`;
  fs.appendFileSync(path.join(__dirname, 'sent_emails.log'), line);
  console.log('Simulated email sent:', to, subject);
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function setOtp(key, code, ttl = 5 * 60 * 1000) {
  const expiresAt = Date.now() + ttl;
  otps.set(key, { code, expiresAt });
}

function verifyOtp(key, code) {
  const rec = otps.get(key);
  if (!rec) return false;
  if (Date.now() > rec.expiresAt) {
    otps.delete(key);
    return false;
  }
  const ok = rec.code === String(code);
  if (ok) otps.delete(key);
  return ok;
}

function createAccessToken(user) {
  const payload = { sub: user.username, role: user.role || 'officer' };
  return jwt.sign(payload, SECRET, { expiresIn: '2h' });
}

// Authenticate: accepts any username/password and returns a JWT containing a mosip_id
app.post('/mosip/authenticate', (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: 'username required' });

  const mosip_id = generateMosipId();
  const payload = { sub: username, mosip_id };
  const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });

  // store basic mock user
  users.set(mosip_id, {
    mosip_id,
    username,
    name: username,
    dob: '1990-01-01',
    gender: 'U'
  });

  res.json({ access_token: token, token_type: 'bearer', expires_in: 3600, mosip_id });
});

// --- Application auth (admin + officers) ---

// Request an esignet OTP to be sent to the user's email (login-with-esignet)
app.post('/auth/esignet-request', (req, res) => {
  const { identifier } = req.body || {}; // username or email
  if (!identifier) return res.status(400).json({ error: 'identifier required' });

  const user = Array.from(users.values()).find(u => u.username === identifier || u.email === identifier);
  if (!user) return res.status(404).json({ error: 'user not found' });

  const code = generateOtp();
  setOtp(`esignet:${user.username}`, code);
  sendEmail(user.email, 'Your eSign-in code', `Your code is ${code}`);

  const resp = { message: 'OTP sent to registered email' };
  if (process.env.DEV_RETURN_OTP === 'true') resp.code = code;
  res.json(resp);
});

// Verify the esignet code and return access token
app.post('/auth/esignet-verify', (req, res) => {
  const { identifier, code } = req.body || {};
  if (!identifier || !code) return res.status(400).json({ error: 'identifier and code required' });
  const user = Array.from(users.values()).find(u => u.username === identifier || u.email === identifier);
  if (!user) return res.status(404).json({ error: 'user not found' });
  const ok = verifyOtp(`esignet:${user.username}`, code);
  if (!ok) return res.status(401).json({ error: 'invalid or expired code' });
  const token = createAccessToken(user);
  res.json({ access_token: token, role: user.role, username: user.username });
});

// Login with username/password -> generates OTP and returns login_token
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = users.get(username);
  if (!user) return res.status(404).json({ error: 'user not found' });
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== user.passwordHash) return res.status(401).json({ error: 'invalid credentials' });

  const loginToken = crypto.randomBytes(16).toString('hex');
  loginTokens.set(loginToken, { username: user.username, expiresAt: Date.now() + 10 * 60 * 1000 });

  const code = generateOtp();
  setOtp(`login:${user.username}`, code);
  sendEmail(user.email, 'Your login code', `Your login code is ${code}`);

  const resp = { login_token: loginToken, message: 'OTP sent to email' };
  if (process.env.DEV_RETURN_OTP === 'true') resp.code = code;
  res.json(resp);
});

// Verify login_token + OTP -> return access token
app.post('/auth/verify-otp', (req, res) => {
  const { login_token, code } = req.body || {};
  if (!login_token || !code) return res.status(400).json({ error: 'login_token and code required' });
  const rec = loginTokens.get(login_token);
  if (!rec || Date.now() > rec.expiresAt) return res.status(401).json({ error: 'invalid or expired login token' });
  const username = rec.username;
  const ok = verifyOtp(`login:${username}`, code);
  if (!ok) return res.status(401).json({ error: 'invalid or expired code' });
  loginTokens.delete(login_token);
  const user = users.get(username);
  const token = createAccessToken(user);
  res.json({ access_token: token, role: user.role, username: user.username });
});

// Admin-protected: create officer
app.post('/auth/create-officer', (req, res) => {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: 'missing token' });
  try {
    const decoded = jwt.verify(m[1], SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }

  const { fullname, email, phoneNumber, username, password, role } = req.body || {};
  if (!username || !password || !email) return res.status(400).json({ error: 'username, password, email required' });
  if (users.has(username)) return res.status(409).json({ error: 'username exists' });

  const user = {
    fullname,
    email,
    phoneNumber,
    username,
    passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
    role: role || 'officer'
  };
  users.set(username, user);
  saveUsersToFile(users);
  res.json({ ok: true, user: { username: user.username, email: user.email, role: user.role } });
});

// List officers (admin)
app.get('/auth/officers', (req, res) => {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: 'missing token' });
  try {
    const decoded = jwt.verify(m[1], SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
  const list = Array.from(users.values()).filter(u => u.role !== 'admin').map(u => ({ username: u.username, fullname: u.fullname, email: u.email, phoneNumber: u.phoneNumber, role: u.role }));
  res.json(list);
});

// Issue a mock ID for provided demographics
app.post('/mosip/mock-id', (req, res) => {
  const demo = req.body || {};
  const mosip_id = generateMosipId();
  const record = Object.assign({ mosip_id }, demo);
  users.set(mosip_id, record);
  res.json(record);
});

// Fetch mock user by MOSIP id
app.get('/mosip/user/:id', (req, res) => {
  const id = req.params.id;
  if (!users.has(id)) return res.status(404).json({ error: 'not found' });
  res.json(users.get(id));
});

// Validate token
app.post('/mosip/validate', (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token required' });
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ valid: true, decoded });
  } catch (err) {
    res.json({ valid: false, error: err.message });
  }
});

// Simple e-sign endpoint: returns HMAC signature of provided document
app.post('/mosip/esign', (req, res) => {
  const { token, document } = req.body || {};
  if (!token || !document) return res.status(400).json({ error: 'token and document required' });
  try {
    const decoded = jwt.verify(token, SECRET);
    const mosip_id = decoded.mosip_id || decoded.sub || 'unknown';
    const h = crypto.createHmac('sha256', SECRET);
    h.update(document + mosip_id);
    const signature = h.digest('base64');
    res.json({ mosip_id, signature, signedAt: new Date().toISOString() });
  } catch (err) {
    res.status(401).json({ error: 'invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock MOSIP server running on http://localhost:${PORT}`);
});
