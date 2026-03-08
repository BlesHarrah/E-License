# Mock MOSIP Server

Lightweight mock server to simulate MOSIP authentication and e-sign endpoints for local development.

Quick start:

```bash
cd mock-server
npm install
npm start
```

Endpoints:
- `POST /mosip/authenticate` { username } -> { access_token, mosip_id }
- `POST /mosip/mock-id` { name,dob,gender,... } -> created record
- `GET /mosip/user/:id` -> record
- `POST /mosip/validate` { token } -> validation result
- `POST /mosip/esign` { token, document } -> { signature, signedAt }

Use `PORT` and `MOSIP_SECRET` env vars to configure.
