const nodemailer = require('nodemailer');


let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "e8a8b92b68d7b0",
      pass: "0eac7bbba9c40c"
    }
  });

transport.verify(function(error, success) {
    if (error) {
         console.log(error);
    } else {
         console.log('Server is ready to take our messages');
    }
 });

 exports.generateMail = function generateMail(toUser, UserSubject, UserText) {
    return {
        from: '"Task Me Team" <brian@sendtask.me>',
        to: toUser,
        subject: UserSubject,
        text: UserText,
        html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer'
    };
 }

 exports.sendMail = transport.sendMail(generateMail('strategos@gmail.com', 'testing email', 'this is only a test'), (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log(`Message sent: ${info.messageId}`)
 });