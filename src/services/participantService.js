import { supabase } from '../lib/supabase';

const toParticipant = (row) => ({
  id: row?.id,
  fullName: row?.full_name,
  email: row?.email,
  phone: row?.phone,
  ticketType: row?.ticket_type,
  qrId: row?.qr_id,
  checkedIn: row?.checked_in,
  checkedInAt: row?.checked_in_at,
  checkedInBy: row?.checked_in_by,
  importedBy: row?.imported_by,
  createdAt: row?.created_at,
  updatedAt: row?.updated_at,
});

export const searchParticipants = async (query) => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('full_name', { ascending: true })
      .limit(20);
    if (error) throw error;
    return { data: (data || []).map(toParticipant), error: null };
  } catch (error) {
    return { data: [], error: error?.message };
  }
};

export const getParticipantByQrId = async (qrId) => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('qr_id', qrId)
      .maybeSingle();
    if (error) throw error;
    return { data: data ? toParticipant(data) : null, error: null };
  } catch (error) {
    return { data: null, error: error?.message };
  }
};

export const checkInParticipant = async (participantId, staffId) => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        checked_in_by: staffId,
      })
      .eq('id', participantId)
      .eq('checked_in', false)
      .select()
      .single();
    if (error) throw error;

    await supabase.from('check_in_logs').insert({
      participant_id: participantId,
      staff_id: staffId,
      action: 'check_in',
    });

    return { data: toParticipant(data), error: null };
  } catch (error) {
    return { data: null, error: error?.message };
  }
};

export const getDashboardMetrics = async () => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('checked_in, ticket_type');
    if (error) throw error;

    const total = data?.length || 0;
    const checkedIn = data?.filter(p => p?.checked_in)?.length || 0;
    const remaining = total - checkedIn;
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100 * 10) / 10 : 0;

    const ticketBreakdown = {};
    data?.forEach(p => {
      if (!ticketBreakdown[p?.ticket_type]) {
        ticketBreakdown[p.ticket_type] = { total: 0, checkedIn: 0 };
      }
      ticketBreakdown[p.ticket_type].total++;
      if (p?.checked_in) ticketBreakdown[p.ticket_type].checkedIn++;
    });

    const ticketTypes = Object.entries(ticketBreakdown).map(([type, counts]) => ({
      type,
      total: counts.total,
      checkedIn: counts.checkedIn,
      remaining: counts.total - counts.checkedIn,
      percentage: counts.total > 0 ? Math.round((counts.checkedIn / counts.total) * 100 * 10) / 10 : 0,
    }));

    return { data: { totalRegistered: total, checkedIn, remaining, percentage, ticketTypes }, error: null };
  } catch (error) {
    return { data: null, error: error?.message };
  }
};

export const bulkImportParticipants = async (rows, importedBy) => {
  const results = { success: 0, failed: 0, errors: [] };
  const BATCH_SIZE = 50;

  for (let i = 0; i < rows?.length; i += BATCH_SIZE) {
    const record = {
  full_name: row?.full_name || row?.fullName || row?.['Full Name'] || '',
  email: (row?.email || row?.Email || '').toLowerCase().trim(),
  qr_id: row?.qr_id || row?.qrId || row?.['QR ID'] || `QR-IMPORT-${Date.now()}-${i + idx}`,
  imported_by: importedBy || null,
};

const phone = row?.phone || row?.Phone || null;
if (phone) record.phone = phone;

const ticket_type = row?.ticket_type || row?.['ticket_type'] || null;
if (ticket_type) record.ticket_type = ticket_type;

const organization = row?.organization || row?.Organization || null;
if (organization) record.organization = organization;

    const validBatch = batch.filter(r => r.full_name && r.email && isValidEmail(r.email));
    const invalidCount = batch.length - validBatch.length;
    results.failed += invalidCount;
    if (invalidCount > 0) {
      results.errors.push(`${invalidCount} row(s) skipped: missing name or invalid email`);
    }

    if (validBatch.length > 0) {
      const { error } = await supabase
        .from('participants')
        .upsert(validBatch, { onConflict: 'email', ignoreDuplicates: true })
        .select();

      if (error) {
        results.failed += validBatch.length;
        results.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error?.message}`);
      } else {
        results.success += validBatch.length;
      }
    }
  }

  return results;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);