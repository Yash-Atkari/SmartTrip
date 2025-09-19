// services/notificationService.js
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to, // must be in E.164 format, e.g., +91XXXXXXXXXX
    });
    console.log(`✅ SMS sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending SMS:", err.message);
  }
};

// For WhatsApp (Twilio Sandbox)
exports.sendWhatsApp = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886", // Twilio sandbox number
      to: `whatsapp:${to}`, // e.g., whatsapp:+91XXXXXXXXXX
    });
    console.log(`✅ WhatsApp sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending WhatsApp:", err.message);
  }
};
