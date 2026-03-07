import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const TICKET_TYPES = ['Participant', 'Guest', 'Mentee', 'Mentee (Cohort 2)', 'Mentee (Cohort 3)', 'Sponsor/Partner', 'Volunteer'];

const Register = () => {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', organization: '', ticket_type: 'Participant'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const generateQrId = () => `DTL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  const sendTicketEmail = async (participant) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(participant.qr_id)}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:40px 32px;text-align:center;">
          <p style="color:#f5a623;font-size:13px;font-weight:bold;letter-spacing:3px;margin:0 0 8px 0;">SHE DARES 2 LEAD PRESENTS</p>
          <h1 style="color:white;font-size:32px;font-weight:900;margin:0 0 8px 0;">DARE TO LEAD</h1>
          <h2 style="color:white;font-size:18px;font-weight:400;margin:0 0 16px 0;">CONFERENCE 2026</h2>
          <div style="background:rgba(245,166,35,0.15);border:1px solid rgba(245,166,35,0.4);border-radius:8px;padding:10px 20px;display:inline-block;">
            <p style="color:#f5a623;font-size:13px;margin:0;font-style:italic;">Ready to Lead the Future — From Barriers to Breakthroughs</p>
          </div>
        </div>
        <div style="padding:32px 32px 0;">
          <h2 style="color:#1a1a2e;font-size:22px;margin:0 0 12px 0;">You're registered! 🎉</h2>
          <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 8px 0;">Dear <strong>${participant.full_name}</strong>,</p>
          <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">Your registration for the Dare to Lead Conference 2026 has been confirmed. Please find your unique entry QR code below — present it at the check-in desk on the day of the event.</p>
        </div>
        <div style="margin:24px 32px;background:#f8f9ff;border-radius:12px;padding:20px 24px;">
          <h3 style="color:#1a1a2e;font-size:14px;font-weight:bold;letter-spacing:1px;margin:0 0 16px 0;">EVENT DETAILS</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#888;font-size:13px;width:100px;">📅 Date</td><td style="padding:6px 0;color:#1a1a2e;font-size:13px;font-weight:600;">Saturday, 7th March 2026</td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:13px;">⏰ Time</td><td style="padding:6px 0;color:#1a1a2e;font-size:13px;font-weight:600;">9:00 AM</td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:13px;">📍 Venue</td><td style="padding:6px 0;color:#1a1a2e;font-size:13px;font-weight:600;">Spiritlife Revival Ministries, The Oracles' Place, Adenta</td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:13px;">🎫 Category</td><td style="padding:6px 0;color:#1a1a2e;font-size:13px;font-weight:600;">${participant.ticket_type || 'Participant'}</td></tr>
          </table>
        </div>
        <div style="padding:0 32px;text-align:center;">
          <h3 style="color:#1a1a2e;font-size:14px;font-weight:bold;letter-spacing:1px;margin:0 0 16px 0;">YOUR ENTRY QR CODE</h3>
          <div style="background:#f8f9ff;border:2px dashed #d0d5ff;border-radius:16px;padding:24px;display:inline-block;">
            <img src="${qrUrl}" alt="QR Code" width="200" height="200" style="display:block;margin:0 auto 12px;" />
            <p style="color:#888;font-size:11px;font-family:monospace;margin:0;">${participant.qr_id}</p>
          </div>
          <p style="color:#888;font-size:12px;margin:12px 0 0;">Screenshot or print this QR code and present it at the entrance</p>
        </div>
        <div style="margin:32px;padding:20px;background:#1a1a2e;border-radius:12px;text-align:center;">
          <p style="color:#f5a623;font-size:13px;font-weight:bold;margin:0 0 8px 0;">Follow us</p>
          <p style="color:#aaa;font-size:12px;margin:0;">Facebook & LinkedIn: She Dares To Lead &nbsp;|&nbsp; Instagram: @shedares2lead_ &nbsp;|&nbsp; Twitter: @SheDares2Lead</p>
        </div>
        <div style="padding:16px 32px;text-align:center;">
          <p style="color:#ccc;font-size:11px;margin:0;">© 2026 She Dares 2 Lead. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: participant.email,
      subject: '🎫 Your Dare to Lead Conference 2026 Ticket',
      html: emailHtml,
    }),
  });

  return response.ok;
};

  const handleSubmit = async () => {
    setError('');
    if (!form.full_name.trim() || !form.email.trim()) {
      setError('Full name and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    // Check if email already registered
    const { data: existing } = await supabase
      .from('participants')
      .select('id, email')
      .eq('email', form.email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      setError('This email is already registered. Please check your inbox for your ticket.');
      setLoading(false);
      return;
    }

    const qr_id = generateQrId();
    const participant = {
      full_name: form.full_name.trim(),
      email: form.email.toLowerCase().trim(),
      phone: form.phone.trim() || null,
      organization: form.organization.trim() || null,
      ticket_type: form.ticket_type,
      qr_id,
    };

    const { error: insertError } = await supabase
      .from('participants')
      .insert(participant);

    if (insertError) {
      setError('Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // Send ticket email
    try {
      await sendTicketEmail(participant);
    } catch (e) {
      console.error('Email send failed:', e);
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1a1a2e 0%,#0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', background: '#f0fff4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>✅</div>
          <h2 style={{ color: '#1a1a2e', fontSize: '24px', fontWeight: '800', margin: '0 0 12px' }}>You're In!</h2>
          <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.6', margin: '0 0 8px' }}>
            Your registration is confirmed. Check your email for your unique QR code ticket.
          </p>
          <p style={{ color: '#888', fontSize: '13px', margin: '0 0 24px' }}>
            Don't forget — <strong>Saturday, 7th March 2026 at 9AM</strong><br />
            Spiritlife Revival Ministries, The Oracles' Place, Adenta
          </p>
          <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '16px', fontSize: '13px', color: '#555' }}>
            Didn't receive the email? Check your spam folder.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '520px', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ color: '#f5a623', fontSize: '12px', fontWeight: 'bold', letterSpacing: '3px', margin: '0 0 8px' }}>SHE DARES 2 LEAD</p>
          <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '900', margin: '0 0 4px' }}>DARE TO LEAD</h1>
          <h2 style={{ color: '#1a1a2e', fontSize: '16px', fontWeight: '400', margin: '0 0 16px' }}>CONFERENCE 2026</h2>
          <div style={{ background: '#f8f9ff', borderRadius: '8px', padding: '10px 16px', marginBottom: '8px' }}>
            <p style={{ color: '#555', fontSize: '13px', margin: '0' }}>📅 Saturday, 7th March 2026 &nbsp;|&nbsp; ⏰ 9AM</p>
            <p style={{ color: '#555', fontSize: '13px', margin: '4px 0 0' }}>📍 Spiritlife Revival Ministries, The Oracles' Place, Adenta</p>
          </div>
          <p style={{ color: '#888', fontSize: '13px', margin: '0' }}>Fill in the form below to secure your spot</p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '6px' }}>Full Name *</label>
            <input
              type="text" name="full_name" value={form.full_name} onChange={handleChange}
              placeholder="Enter your full name"
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '6px' }}>Email Address *</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="Enter your email"
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '6px' }}>Phone Number</label>
            <input
              type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="Enter your phone number"
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '6px' }}>Organization / Affiliation</label>
            <input
              type="text" name="organization" value={form.organization} onChange={handleChange}
              placeholder="Enter your organization"
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '6px' }}>Category</label>
            <select
              name="ticket_type" value={form.ticket_type} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
            >
              {TICKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px 16px', color: '#cc0000', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: loading ? '#ccc' : 'linear-gradient(135deg,#1a1a2e,#0f3460)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
          >
            {loading ? 'Registering...' : 'Register & Get My Ticket →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;