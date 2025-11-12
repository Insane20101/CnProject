const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
const useSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

// Validate email credentials
if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com' || emailPass === 'your-app-password') {
  console.warn('⚠️  WARNING: Email credentials not configured properly!');
  console.warn('Please create a .env file with your email credentials.');
  console.warn('See env.example for reference.');
}


let smtpReady = false;


const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: useSecure, // true for 465, false for other ports
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  },
  
  requireTLS: true, // Always require TLS for Gmail
  connectionTimeout: 30000, 
  greetingTimeout: 30000, 
  socketTimeout: 30000, 
  debug: process.env.DEBUG === 'true',
  logger: process.env.DEBUG === 'true',

  
  pool: true,
  maxConnections: 5,
  maxMessages: Infinity,
  rateDelta: 1000,
  rateLimit: 5
});


function createTransporter() {
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: useSecure,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false
    },
    requireTLS: true, 
    connectionTimeout: 30000, 
    greetingTimeout: 30000, 
    socketTimeout: 30000, 
    debug: process.env.DEBUG === 'true',
    logger: process.env.DEBUG === 'true',
    
    
    pool: {
      maxConnections: 5,
      maxMessages: Infinity,
      rateDelta: 1000,
      rateLimit: 5
    },
    
    maxConnections: Infinity
  });
}


async function verifySMTPConnection() {
  try {
    if (!emailUser || !emailPass) {
      console.error('❌ Email credentials missing!');
      console.error('Please set EMAIL_USER and EMAIL_PASS in your .env file');
      smtpReady = false;
      return false;
    }

    await transporter.verify();
    console.log('✅ SMTP Server is ready to send emails');
    console.log(`📧 Configured email: ${emailUser}`);
    smtpReady = true;
    return true;
  } catch (error) {
    console.error('❌ SMTP Authentication Error:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    
    if (error.code === 'EAUTH' || error.message.includes('Invalid login')) {
      console.error('\n🔧 Troubleshooting Invalid Login Error:');
      console.error('1. For Gmail:');
      console.error('   - Enable 2-Factor Authentication');
      console.error('   - Generate App Password at: https://myaccount.google.com/apppasswords');
      console.error('   - Use the 16-character App Password (not your regular password)');
      console.error('   - Remove spaces from the App Password');
      console.error('2. Check your .env file:');
      console.error('   - EMAIL_USER should be your full email address');
      console.error('   - EMAIL_PASS should be your App Password (for Gmail)');
      console.error('   - Make sure there are no extra spaces or quotes');
      console.error('3. Verify SMTP settings:');
      console.error(`   - Host: ${smtpHost}`);
      console.error(`   - Port: ${smtpPort}`);
      console.error(`   - Secure: ${useSecure}`);
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Connection Error:');
      console.error('1. Check your internet connection');
      console.error('2. Verify SMTP host and port are correct');
      console.error('3. Check if firewall is blocking the connection');
    } else {
      console.error('\n🔧 General Error:');
      console.error('Please check your SMTP configuration in .env file');
    }
    smtpReady = false;
    return false;
  }
}


verifySMTPConnection();


app.post('/api/send-email', async (req, res) => {
  try {
    const { recipientEmail } = req.body;

    
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

   
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com', // Sender email
      to: recipientEmail, // Recipient email
      subject: 'SMTP Protocol Demonstration - Semester Project',
      text: 'This is a test email sent using SMTP protocol for demonstration purposes.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">SMTP Protocol Demonstration</h2>
          <p>Hello,</p>
          <p>This email was successfully sent using the <strong>SMTP (Simple Mail Transfer Protocol)</strong> for a semester project demonstration.</p>
          <p>The email was sent from the backend server using Node.js and Nodemailer library.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            <strong>Sender:</strong> ${process.env.EMAIL_USER || 'your-email@gmail.com'}<br>
            <strong>Recipient:</strong> ${recipientEmail}<br>
            <strong>Protocol:</strong> SMTP<br>
            <strong>Date:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };


    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    console.log('✅ Connection is kept open for more emails');
    
    res.json({
      success: true,
      message: 'Email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please check your SMTP configuration.',
      error: error.message
    });
  }
});


app.get('/api/status', (req, res) => {
  if (smtpReady) {
    return res.json({ success: true, smtpConfigured: true, emailUser: emailUser });
  }
  return res.json({ success: true, smtpConfigured: false });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Make sure to configure your email credentials in .env file`);
});

