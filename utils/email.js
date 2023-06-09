const nodemailer = require('nodemailer');

//new Email(user, url).sendWelcome();
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `samad dayo <${process.env.EMAIL_FROM}>`;
    }

    createTransport(){
        const sendEmail = async options =>{
            
            //create a transporter
             transporter = nodemailer.createTransport({
                host:process.env.EMAIL_HOST,
                port:process.env.EMAIL_PORT,
                auth:{
                    user:process.env.EMAIL_USERNAME,
                    pass:process.env.EMAIL_PASSWORD
                }
    
            })
        };
    }
    send(template, subject) {
        //send the actual email

        //render email base on template engine been use
          
    //define the email options
    const mailOptions = {
        from:'samad dayo <"samad@7.io',
        to: options.email,
        subject: options.subject,
        text: options.message
        
    };
    // create a transport and send email

    }
    sendWelcome() {
        this.send('Welcome', 'welcome to renby family!')
    }
};


const sendEmail = async options =>{
    //create a transporter
    
    
    //actually send the email
   await transporter.sendMail(mailOptions)
}
