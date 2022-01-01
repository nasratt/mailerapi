# Mailer API

This API can be used to send emails by providing the reciever address and email content in request body. It uses the Gmail API and nodemailer for this purpose.

The body of request should be in `json` fromat and have following format:

```json
{
  "from": String - required,
  "reciever": String - email - required,
  "subject": String - required,
  "text": String - required - (for clients not supporting HTML),
  "html": String - optional - (gets sanitized)
}
```

The only endpoint in this API is `/mailto` and the method to be used is `POST`. Response to request has the following format:

```json
{
  "success": Boolean,
  "message": String
}
```
