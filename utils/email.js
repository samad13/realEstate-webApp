const nodemailer = require('nodemailer');

const sendEmail = async options =>{
    //create a transporter
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
        //activate less secured app option in gmail
    });

    //define the email options
    const mailOptions = {
        from:'samad dayo <"samad@7.io',
        to: options.email,
        subject: options.subject,
        text: options.message
        //html
    };
    //actually send the email
   await transporter.sendMail(mailOptions)
}


module.exports = sendEmail;