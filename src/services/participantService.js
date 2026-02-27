import { supabase } from '../lib/supabase';

// Convert DB snake_case to camelCase
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

// Search participants by name, email, or phone
export const searchParticipants = async (query) => {
  try {
    const { data, error } = await supabase?.from('participants')?.select('*')?.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)?.order('full_name', { ascending: true })?.limit(20);

    if (error) throw error;
    return { data: (data || [])?.map(toParticipant), error: null };
  } catch (error) {
    return { data: [], error: error?.message };
  }
};

// Get participant by QR ID
export const getParticipantByQrId = async (qrId) => {
  try {
    const { data, error } = await supabase?.from('participants')?.select('*')?.eq('qr_id', qrId)?.maybeSingle();

    if (error) throw error;
    return { data: data ? toParticipant(data) : null, error: null };
  } catch (error) {
    return { data: null, error: error?.message };
  }
};

// Check in a participant
export const checkInParticipant = async (participantId, staffId) => {
  try {
    const { data, error } = await supabase?.from('participants')?.update({
        checked_in: true,
        checked_in_at: new Date()?.toISOString(),
        checked_in_by: staffId,
      })?.eq('id', participantId)?.eq('checked_in', false)?.select()?.single();

    if (error) throw error;

    // Log the check-in
    await supabase?.from('check_in_logs')?.insert({
      participant_id: participantId,
      staff_id: staffId,
      action: 'check_in',
    });

    return { data: toParticipant(data), error: null };
  } catch (error) {
    return { data: null, error: error?.message };
  }
};

// Get dashboard metrics
export const getDashboardMetrics = async () => {
  try {
    const { data, error } = await supabase?.from('participants')?.select('checked_in, ticket_type');

    if (error) throw error;

    const total = data?.length || 0;
    const checkedIn = data?.filter(p => p?.checked_in)?.length || 0;
    const remaining = total - checkedIn;
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100 * 10) / 10 : 0;

    const ticketBreakdown = {};
    data?.forEach(p => {
      if (!ticketBreakdown?.[p?.ticket_type]) {
        ticketBreakdown[p.ticket_type] = { total: 0, checkedIn: 0 };
      }
      ticketBreakdown[p.ticket_type].total++;
      if (p?.checked_in) ticketBreakdown[p.ticket_type].checkedIn++;
    });

    const ticketTypes = Object.entries(ticketBreakdown)?.map(([type, counts]) => ({
      type,
      total: counts?.total,
      checkedIn: counts?.checkedIn,
      remaining: counts?.total - counts?.checkedIn,
      percentage: counts?.total > 0 ? Math.round((counts?.checkedIn / counts?.total) * 100 * 10) / 10 : 0,
    }));

    return {
      data: { totalRegistered: total, checkedIn, remaining, percentage, ticketTypes },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error?.message };
  }
};

// Bulk import participants from parsed CSV rows
export const bulkImportParticipants = async (rows, importedBy) => {
  const results = { success: 0, failed: 0, errors: [] };
  const BATCH_SIZE = 50;

  for (let i = 0; i < rows?.length; i += BATCH_SIZE) {
    const batch = rows?.slice(i, i + BATCH_SIZE)?.map((row, idx) => ({
      full_name: row?.full_name || row?.fullName || row?.['Full Name'] || row?.['full name'] || '',
      email: (row?.email || row?.Email || '')?.toLowerCase()?.trim(),
      phone: row?.phone || row?.Phone || row?.['Phone Number'] || null,
      ticket_type: normalizeTicketType(row?.ticket_type || row?.ticketType || row?.['Ticket Type'] || 'General Admission'),
      qr_id: row?.qr_id || row?.qrId || row?.['QR ID'] || `QR-IMPORT-${Date.now()}-${i + idx}`,
      imported_by: importedBy || null,
    }));

    const validBatch = batch?.filter(r => r?.full_name && r?.email && isValidEmail(r?.email));
    const invalidCount = batch?.length - validBatch?.length;
    results.failed += invalidCount;
    if (invalidCount > 0) {
      results?.errors?.push(`${invalidCount} row(s) skipped: missing name or invalid email`);
    }

    if (validBatch?.length > 0) {
      const { error } = await supabase?.from('participants')?.upsert(validBatch, { onConflict: 'email', ignoreDuplicates: false })?.select();

      if (error) {
        results.failed += validBatch?.length;
        results?.errors?.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error?.message}`);
      } else {
        results.success += validBatch?.length;
      }
    }
  }

  return results;
};

const VALID_TICKET_TYPES = ['VIP Pass', 'General Admission', 'Early Bird', 'Student Pass', 'Speaker Pass'];

const normalizeTicketType = (value) => {
  const normalized = (value || '')?.trim();
  const match = VALID_TICKET_TYPES?.find(
    t => t?.toLowerCase() === normalized?.toLowerCase()
  );
  return match || 'General Admission';
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(email);
