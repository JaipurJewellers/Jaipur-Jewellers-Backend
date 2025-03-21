import nodemailer from 'nodemailer'
import hbs from 'nodemailer-handlebars';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendContactToAdmin = async (email, message, name) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: name,
        text: message,
        replyTo: email
    };

    await transporter.sendMail(mailOptions);
};

export const mail_contact = async(app_details) => {
    
    const {email} = app_details;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
  
    // Ensure Handlebars is correctly set up
    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extName: ".handlebars",
          partialsDir: path.join(__dirname, "views/"),
          defaultLayout: false,
        },
        viewPath: path.join(__dirname, "views/"),
        extName: ".handlebars",
      })
    );
  
    let templateName = "message";

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Contact Us Details for Test",
        text: `Test Details`,
        template: templateName,
        context: {...app_details},
      };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("Error sending email:", error);
      throw new Error("Failed to Send Mail.");
    }
  }
