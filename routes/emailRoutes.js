const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/html'];
    const allowedExtensions = ['.html', '.pdf'];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and HTML files are allowed'), false);
    }
  }
});

router.post('/send-invoice', upload.single('bill'), async (req, res) => {
  try {
    const { to, subject, message, cc, bcc } = req.body;
    const file = req.file;

    console.log('📧 Email request received:', { to, subject, hasFile: !!file, fileName: file?.originalname });

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required'
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email credentials missing!');
      return res.status(500).json({
        success: false,
        message: 'Email server not configured.'
      });
    }

    console.log('📧 Using email:', process.env.EMAIL_USER);

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

    await transporter.verify();
    console.log('✅ Email transporter verified');

    // Prepare email with attachment
    const mailOptions = {
      from: `"Viral Ads Media" <${process.env.EMAIL_USER}>`,
      to: to,
      cc: cc || '',
      bcc: bcc || '',
      subject: subject,
      html: message || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ea580c;">Viral Ads Media</h2>
            <p style="color: #64748b;">Invoice Management System</p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <p>Dear Customer,</p>
            <p>Please find attached your invoice for the services provided.</p>
          </div>
          <div style="margin-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>Viral Ads Media - B-27, Khatu shyam Mandir Road, New Delhi</p>
            <p>Phone: +91 93544 91934 | Email: info@viraladsmedia.com</p>
          </div>
        </div>
      `,
      attachments: file ? [{
        filename: file.originalname || 'invoice.html',
        content: file.buffer,
        contentType: file.mimetype || 'text/html'
      }] : []
    };

    console.log('📎 Attachment:', file?.originalname, 'Size:', file?.size);

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
      messageId: info.messageId,
      attachment: file ? file.originalname : null
    });

  } catch (error) {
    console.error('❌ Email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email: ' + error.message
    });
  }
});

module.exports = router;