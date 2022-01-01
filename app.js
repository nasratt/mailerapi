import express from 'express';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

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

app.post(
  '/mailto',
  body('reciever').isEmail().withMessage('value is not an email!'),
  body(['from', 'subject', 'text'])
    .not()
    .isEmpty()
    .escape()
    .trim()
    .withMessage('value can not be empty!'),
  (req, res) => {
    const { from, reciever, subject, text, html } = req.body;
    const validationRes = validationResult(req);

    if (!validationRes.isEmpty()) {
      const errors = validationRes
        .array()
        .map(({ msg, param }) => `${param} ${msg}`);

      res.status(403).json({
        success: false,
        message: errors
      });
      return;
    }

    // Message object
    let message = {
      from: `${from} <${USER}>`,
      to: `${reciever}`,
      subject: `${subject}`,
      text: `${text}`,
      html: `${sanitizeHtml(html || '')}`
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log('Error: ' + err.message);
        res.status(500).json({
          success: false,
          message: 'Something went wrong, email could not be sent!'
        });
        return;
      }
      console.log(info);
      res
        .status(200)
        .json({ success: true, message: 'Email was sent successfully!' });
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
