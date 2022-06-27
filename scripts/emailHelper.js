const nodemailer = require('nodemailer');
const fsHelper = require('./firestoreHelper')


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

exports.generateMail = async function generateMail(taskId) {
    let user = await fsHelper.findUserFromTaskId(taskId);
    
    let mailOptions = {
        from: '"Task Me Team" <brian@sendtask.me>',
        to: `${user.displayName} <${user.emailAddress}>`,
        subject: `Your task '${user.taskname}' was completed!`,
        text: `Hello! Your task '${user.taskname} was completed by Brian! You can view proof of completion here: https://www.sendtask.me/showtask/${taskId}'`,
        html: `Hello! Your task '${user.taskname} was completed by Brian! You can view proof of completion here: <a href="https://www.sendtask.me/showtask/${taskId}" target="_blank">here!</a>`
    };

transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log(`Message sent: ${info.messageId}`)
 })
}