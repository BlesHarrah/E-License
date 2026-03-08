import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import * as auth from '../services/mockAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'password' | 'esignet'>('password');

  // common
  const [role, setRole] = useState<string>('');

  // password flow
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginToken, setLoginToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');

  // esignet flow
  const [identifier, setIdentifier] = useState('');
  const [esignetRequested, setEsignetRequested] = useState(false);

  const [loading, setLoading] = useState(false);

  function handleNavigateByRole(roleStr?: string) {
    const r = roleStr || role;
    localStorage.setItem('userRole', r || 'officer');
    if (r === 'admin') navigate('/admin');
    else if (r === 'licensing') navigate('/licensing-officer');
    else if (r === 'traffic') navigate('/traffic-officer');
    else navigate('/');
  }

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return toast.error('Please select a role');
    setLoading(true);
    try {
      const resp = await auth.loginWithPassword(username, password);
      if (resp && resp.login_token) {
        setLoginToken(resp.login_token);
        toast.success('OTP sent to your email');
      } else {
        toast.error('Unexpected login response');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyPasswordOtp = async () => {
    if (!loginToken) return;
    setLoading(true);
    try {
      const resp = await auth.verifyLoginOtp(loginToken, otp);
      if (resp && resp.access_token) {
        localStorage.setItem('access_token', resp.access_token);
        localStorage.setItem('username', resp.username || username);
        toast.success('Login successful');
        handleNavigateByRole(resp.role);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const requestEsignet = async () => {
    if (!identifier) return toast.error('Enter username or email');
    setLoading(true);
    try {
      const resp = await auth.requestEsignet(identifier);
      setEsignetRequested(true);
      toast.success(resp?.message || 'OTP requested');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Request failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyEsignet = async () => {
    if (!identifier) return toast.error('Missing identifier');
    setLoading(true);
    try {
      const resp = await auth.verifyEsignet(identifier, otp);
      if (resp && resp.access_token) {
        localStorage.setItem('access_token', resp.access_token);
        localStorage.setItem('username', resp.username || identifier);
        toast.success('Login successful');
        handleNavigateByRole(resp.role);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-4 rounded-full">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">E-License Login</CardTitle>
          <CardDescription>Choose a login method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant={mode === 'password' ? 'default' : 'secondary'} onClick={() => setMode('password')} className="flex-1">
              Password
            </Button>
            <Button variant={mode === 'esignet' ? 'default' : 'secondary'} onClick={() => setMode('esignet')} className="flex-1">
              Login with eSignet
            </Button>
          </div>

          {mode === 'password' && (
            <form onSubmit={submitPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="licensing">Licensing Officer</SelectItem>
                    <SelectItem value="traffic">Traffic Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                Continue
              </Button>

              {loginToken && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input id="otp" type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <Button onClick={verifyPasswordOtp} className="w-full" disabled={loading}>
                    Verify OTP
                  </Button>
                </div>
              )}
            </form>
          )}

          {mode === 'esignet' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Username or Email</Label>
                <Input id="identifier" type="text" placeholder="username or email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              </div>

              {!esignetRequested ? (
                <Button onClick={requestEsignet} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                Continue
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="otp-esignet">Enter Code</Label>
                  <Input id="otp-esignet" type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <Button onClick={verifyEsignet} className="w-full" disabled={loading}>
                    Verify
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
