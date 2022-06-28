require("dotenv").config();
const nodemailer = require('nodemailer');
const fsHelper = require('./firestoreHelper')


let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "brian.gonzales10@gmail.com",
      pass: process.env.GMAIL_KEY
    }
  });

transport.verify(function(error, success) {
    if (error) {
         console.log(error);
    } else {
         console.log('Server is ready to take our messages');
    }
 });

exports.generateMail = async function generateMail(taskId) {
    let user = await fsHelper.findUserFromTaskId(taskId);
    
    let mailOptions = {
        from: '"Task Me Team" <brian@sendtask.me>',
        to: `${user.displayName} <${user.emailAddress}>`,
        subject: `Your task '${user.taskName}' was completed!`,
        text: `Hello! Your task '${user.taskName} was completed by Brian! You can view proof of completion here: https://www.sendtask.me/showtask/${taskId}'`,
        html: `Hello! <br /> Your task '${user.taskName} was completed by Brian! You can view proof of completion here: <a href="https://www.sendtask.me/" target="_blank">here!</a>`
    };

transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log(`Message sent: ${info.messageId}`)
 })
}