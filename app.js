import express from 'express';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

import { validateEmail } from './validation.js';

const app = express();
app.use(express.json());
dotenv.config();

const USER = process.env.USER;
const PORT = process.env.PORT || 8080;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URL = process.env.REDIRECT_URL;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: `${USER}`,
    clientId: `${CLIENT_ID}`,
    clientSecret: `${CLIENT_SECRET}`,
    refreshToken: `${REFRESH_TOKEN}`
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.post('/mailto', (req, res) => {
  const { reciever, emailBody, subject } = req.body;
  if (
    !validateEmail(reciever) ||
    emailBody.trim() === '' ||
    subject.trim() === ''
  ) {
    res.status(403).json({
      success: false,
      message: 'Request was unsuccessful due to invalid body.'
    });
  }

  // Message object
  let message = {
    from: `Janm Asti <${USER}>`,
    to: `${reciever}`,
    subject: `${subject}`,
    text: `${emailBody}`
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log('Error occurred. ' + err.message);
      res.json({
        success: false,
        message: 'Something went wrong, email could not be sent!'
      });
      transporter.close();
      return;
    }

    res.json({ success: true, message: 'Email sent successfully!' });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}!`);
});
