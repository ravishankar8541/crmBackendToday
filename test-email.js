require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('\n=================================');
  console.log('📧 EMAIL TEST');
  console.log('=================================\n');

  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Domain:', process.env.EMAIL_USER?.split('@')[1]);
  console.log('Password Length:', process.env.EMAIL_PASSWORD?.length);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Missing credentials!');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  console.log('\n🔗 Testing connection...');

  try {
    await transporter.verify();
    console.log('✅ Connection successful!');
    
    console.log('\n📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"Viral Ads Media Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Email Test Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ea580c;">✅ Email Test Successful!</h1>
          <p>Your email configuration is working perfectly.</p>
          <hr>
          <p style="color: #64748b;">From: ${process.env.EMAIL_USER}</p>
          <p style="color: #64748b;">Time: ${new Date().toLocaleString()}</p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log(`📧 Check your inbox at: ${process.env.EMAIL_USER}`);
    
  } catch (error) {
    console.log('\n❌ Failed:', error.message);
    
    if (error.message.includes('535')) {
      console.log('\n💡 App Password issue:');
      console.log('1. Go to: https://myaccount.google.com/apppasswords');
      console.log('2. Generate a NEW App Password');
      console.log('3. Update .env with the new password');
      console.log('4. Remove ALL spaces from the password');
    }
  }
}

testEmail();