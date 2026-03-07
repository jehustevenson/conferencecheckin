import React, { useState, useEffect } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import { supabase } from '../../lib/supabase';

const SendTickets = () => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [failedList, setFailedList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [singleEmail, setSingleEmail] = useState('');
  const [singleSending, setSingleSending] = useState(false);
  const [singleResult, setSingleResult] = useState('');

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
  const { data } = await supabase
    .from('participants')
    .select('*')
    .eq('ticket_sent', false)
    .order('full_name', { ascending: true });
  setAttendees(data || []);
  setLoading(false);
};

  const buildEmailHtml = (participant) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(participant.qr_id)}`;
    return `
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
  };

  const sendEmail = async (participant) => {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: participant.email,
      subject: '🎫 Your Dare to Lead Conference 2026 Ticket',
      html: buildEmailHtml(participant),
    }),
  });

  if (response.ok) {
    // Mark as sent in database
    await supabase
      .from('participants')
      .update({ ticket_sent: true })
      .eq('id', participant.id);
  }

  return response.ok;
};

  const runBulkSend = async (list) => {
    setSending(true);
    setSentCount(0);
    setFailedList([]);
    setProgress(0);
    setDone(false);

    let sent = 0;
    const failed = [];

    for (let i = 0; i < list.length; i++) {
      const success = await sendEmail(list[i]);
      if (success) {
        sent++;
      } else {
        failed.push(list[i]);
      }
      setProgress(Math.round(((i + 1) / list.length) * 100));
      setSentCount(sent);
      setFailedList([...failed]);
      await new Promise(r => setTimeout(r, 1000));
    }

    setSending(false);
    setDone(true);
  };

  const handleSendAll = async () => {
    if (!window.confirm(`Send QR tickets to all ${attendees.length} attendees?`)) return;
    await runBulkSend(attendees);
  };

  const handleRetryFailed = async () => {
    if (!window.confirm(`Retry sending to ${failedList.length} failed attendees?`)) return;
    await runBulkSend(failedList);
  };

  const handleSendSingle = async () => {
    if (!singleEmail.trim()) return;
    const attendee = attendees.find(a => a.email.toLowerCase() === singleEmail.toLowerCase().trim());
    if (!attendee) {
      setSingleResult('error:Email not found in attendee list.');
      return;
    }
    setSingleSending(true);
    setSingleResult('');
    const success = await sendEmail(attendee);
    setSingleSending(false);
    setSingleResult(success ? 'success:Ticket sent successfully!' : 'error:Failed to send. Please try again.');
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation />
      <div className="pt-14 sm:pt-16 md:pt-20">
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Send QR Tickets</h1>
            <p className="text-sm text-muted-foreground">Send personalized QR code tickets to attendees by email</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">

              {/* Send Individual */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-1">Send to Individual</h2>
                <p className="text-sm text-muted-foreground mb-4">Enter an attendee's email to send their ticket</p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={singleEmail}
                    onChange={e => { setSingleEmail(e.target.value); setSingleResult(''); }}
                    placeholder="attendee@email.com"
                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={handleSendSingle}
                    disabled={singleSending}
                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {singleSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
                {singleResult && (
                  <p className={`mt-3 text-sm font-medium ${singleResult.startsWith('success') ? 'text-success' : 'text-red-500'}`}>
                    {singleResult.split(':')[1]}
                  </p>
                )}
              </div>

              {/* Send All */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-1">Send to All Attendees</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Send QR tickets to all <strong>{attendees.length}</strong> attendees at once
                </p>

                {sending && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Sending tickets...</span>
                      <span className="font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-success">✓ {sentCount} sent</span>
                      <span className="text-red-500">✗ {failedList.length} failed</span>
                    </div>
                  </div>
                )}

                {done && (
                  <div className="mb-4 space-y-3">
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <p className="text-success font-medium text-sm">✓ Done! {sentCount} tickets sent successfully.</p>
                    </div>
                    {failedList.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-600 font-medium text-sm mb-3">✗ {failedList.length} failed to send:</p>
                        <div className="max-h-40 overflow-y-auto space-y-1 mb-3">
                          {failedList.map(a => (
                            <p key={a.id} className="text-xs text-red-500">{a.full_name} — {a.email}</p>
                          ))}
                        </div>
                        <button
                          onClick={handleRetryFailed}
                          disabled={sending}
                          className="w-full py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          Retry {failedList.length} Failed
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleSendAll}
                  disabled={sending}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {sending ? `Sending... (${sentCount}/${attendees.length})` : `Send Tickets to All ${attendees.length} Attendees`}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendTickets;