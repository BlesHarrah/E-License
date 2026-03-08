import axios from "axios";

const API = import.meta.env.VITE_MOCK_MOSIP_URL || "http://localhost:4000";

export async function requestEsignet(identifier: string) {
  return axios.post(`${API}/auth/esignet-request`, { identifier }).then(r => r.data);
}

export async function verifyEsignet(identifier: string, code: string) {
  return axios.post(`${API}/auth/esignet-verify`, { identifier, code }).then(r => r.data);
}

export async function loginWithPassword(username: string, password: string) {
  return axios.post(`${API}/auth/login`, { username, password }).then(r => r.data);
}

export async function verifyLoginOtp(login_token: string, code: string) {
  return axios.post(`${API}/auth/verify-otp`, { login_token, code }).then(r => r.data);
}

export async function createOfficer(token: string, officer: any) {
  return axios.post(`${API}/auth/create-officer`, officer, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.data);
}

export async function listOfficers(token: string) {
  return axios.get(`${API}/auth/officers`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.data);
}

export default {
  requestEsignet,
  verifyEsignet,
  loginWithPassword,
  verifyLoginOtp,
  createOfficer,
  listOfficers
};