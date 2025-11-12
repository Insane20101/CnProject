# SMTP Email Demonstration

Simple Node.js demo that sends emails via SMTP using Nodemailer. Includes a small frontend in `public/` and a backend server (`server.js`) that exposes the following endpoints:

- GET /api/status — returns whether SMTP is configured and ready
- POST /api/send-email — send an email (body: { recipientEmail })

Prerequisites

- Node.js 16+ installed
- Internet connection (for SMTP)
- A working SMTP account (this README uses Gmail as an example)

Setup

1. Install dependencies

```powershell
npm install
```

2. Create (or edit) `.env` in the project root with your SMTP credentials. Example:

```text
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-16-char-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
DEBUG=true
PORT=3001
```

Notes for Gmail users

- Enable 2-Step Verification in your Google account.
- Create an App Password at https://myaccount.google.com/apppasswords and copy the 16-character password into `EMAIL_PASS` (remove spaces).
- Do NOT use your regular Gmail password.

Run

```powershell
npm start
```

Open http://localhost:3001 in a browser to use the frontend form.

API

- Status

  GET /api/status

  Response example when configured:
  ```json
  { "success": true, "smtpConfigured": true, "emailUser":"your.email@gmail.com" }
  ```

- Send email

  POST /api/send-email

  JSON body:
  ```json
  { "recipientEmail": "recipient@example.com" }
  ```

  Success response:
  ```json
  { "success": true, "message": "Email sent successfully!", "messageId": "<id>" }
  ```

Troubleshooting

- "EADDRINUSE" on startup: port already in use. Kill the process using that port or change `PORT` in `.env`.
- "EAUTH" / "Invalid login" / 535 errors: credentials wrong. For Gmail use App Passwords and ensure no extra spaces.
- Connection closed (221) immediately after greeting: could be an auth failure or a policy from the SMTP provider. Check credentials, enable DEBUG=true to see detailed logs, and confirm provider allows SMTP from your server.
- If the frontend reports "SMTP not configured": ensure `EMAIL_USER` and `EMAIL_PASS` are set in `.env`, restart the server, and check `GET /api/status`.

Logging and debug

Set `DEBUG=true` in `.env` to enable detailed Nodemailer logs in the server console.

Security

- Do not commit `.env` to source control. Add it to `.gitignore`.
- Treat credentials as secrets and rotate them if suspected compromised.

Keeping connection open

The server is configured to use Nodemailer pooling so SMTP connections are reused. If you still see the server closing the connection (server sends `221`), it usually means the SMTP provider ended the session — check provider policy and authentication. For Gmail, make sure App Passwords are used and there are no account security blocks.

If you want me to also remove comments from all code files, I can do that next and run a quick linter/test.
