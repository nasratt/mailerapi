const bodyParser = require('body-parser');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

function validateEmail(email) {
  const regex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return regex.test(email);
}

let mailAccount, transporter;
async function init() {
  mailAccount = await nodemailer.createTestAccount();
  console.log(mailAccount);
  transporter = nodemailer.createTransport({
    host: mailAccount.smtp.host,
    port: mailAccount.smtp.port,
    secure: mailAccount.smtp.secure,
    auth: {
      user: mailAccount.user,
      pass: mailAccount.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}
init();

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
    from: `${mailAccount.user}`,
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
      return;
    }

    res.json({ success: true, message: 'Email sent successfully!' });
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Listening at http://localhost:${process.env.PORT || 8080}`);
});
