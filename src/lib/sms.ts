// src\lib\sms.ts
import twilio from 'twilio';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendSms = async (message: string) => {
  try {
    const result = await client.messages.create({
      body: message,         
      messagingServiceSid: process.env.TWILIO_MESSAGEING_SERVICE_SID, 
      to: '+963958329660',                    
    });
    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};
