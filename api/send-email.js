import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Dare2Lead Conference" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log('Email error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}