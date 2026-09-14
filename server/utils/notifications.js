import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Initialize Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  }
});

// Initialize Twilio Client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendPurchaseNotifications = async (projectData) => {
  try {
    const { title, service, servicePlan, totalAmount, answersJson } = projectData;
    let answers = {};
    try {
      answers = JSON.parse(answersJson);
    } catch (e) {
      // Ignore
    }

    const customerName = answers.name || 'A customer';
    const customerEmail = answers.email || 'N/A';
    const customerPhone = answers.phone || 'N/A';
    
    // --- 1. Send Email Notification ---
    const mailOptions = {
      from: process.env.SMTP_EMAIL || 'yashmalik015@gmail.com',
      to: 'yashmalik015@gmail.com, assetsweber@assetsweber.com',
      subject: `New Skill Plan Purchase: ${title}`,
      text: `Hello,

A new skill plan/package has been purchased on your website.

Project Details:
- Title: ${title}
- Service: ${service}
- Plan: ${servicePlan}
- Amount: ₹${totalAmount}

Customer Details:
- Name: ${customerName}
- Email: ${customerEmail}
- Phone: ${customerPhone}

View more details in the admin portal.

Best,
Your Website Notifier`
    };

    if (process.env.SMTP_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log('Purchase email sent successfully.');
    } else {
      console.log('Skipping email notification: SMTP_PASSWORD is not set.');
    }

    // --- 2. Send WhatsApp Notification ---
    if (twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
      const waMessage = `*New Skill Plan Purchase!*\n\n*Title:* ${title}\n*Plan:* ${servicePlan}\n*Amount:* ₹${totalAmount}\n\n*Customer Name:* ${customerName}\n*Customer Email:* ${customerEmail}\n*Customer Phone:* ${customerPhone}`;

      await twilioClient.messages.create({
        body: waMessage,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // e.g., whatsapp:+14155238886
        to: 'whatsapp:+919416085060' // User requested number 9416085060, using +91 country code assuming India
      });
      console.log('Purchase WhatsApp message sent successfully.');
    } else {
      console.log('Skipping WhatsApp notification: Twilio credentials or WhatsApp number not configured.');
    }

  } catch (error) {
    console.error('Error sending purchase notifications:', error);
  }
};
