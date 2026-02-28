import React, { useState, useEffect } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { checkInParticipant } from '../../services/participantService';
import { useAuth } from '../../contexts/AuthContext';

const AttendeeList = () => {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | checked_in | not_checked_in
  const [processing, setProcessing] = useState(null);

  const fetchAttendees = async () => {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('full_name', { ascending: true });

    if (!error && data) setAttendees(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  const handleCheckIn = async (participant) => {
  setProcessing(participant.id);

  if (participant.checked_in) {
    // Undo check-in
    const { error } = await supabase
      .from('participants')
      .update({
        checked_in: false,
        checked_in_at: null,
        checked_in_by: null,
      })
      .eq('id', participant.id);

    if (!error) fetchAttendees();
  } else {
    // Check in
    const { error } = await checkInParticipant(participant.id, user?.id);
    if (!error) fetchAttendees();
  }

  setProcessing(null);
};

  const filtered = attendees.filter(a => {
    const matchesSearch =
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.phone?.includes(search);

    const matchesFilter =
      filter === 'all' ||
      (filter === 'checked_in' && a.checked_in) ||
      (filter === 'not_checked_in' && !a.checked_in);

    return matchesSearch && matchesFilter;
  });

  const totalCheckedIn = attendees.filter(a => a.checked_in).length;

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation />

      <div className="pt-14 sm:pt-16 md:pt-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                Attendee List
              </h1>
              <p className="text-sm text-muted-foreground">
                {totalCheckedIn} of {attendees.length} checked in
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium">
                {totalCheckedIn} Checked In
              </span>
              <span className="px-3 py-1.5 bg-warning/10 text-warning rounded-full text-sm font-medium">
                {attendees.length - totalCheckedIn} Remaining
              </span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'checked_in', 'not_checked_in'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'checked_in' ? 'Checked In' : 'Not Checked In'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elevation-2">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Phone</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Checked In At</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                          No attendees found
                        </td>
                      </tr>
                    ) : (
                      filtered.map(a => (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  {a.full_name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-foreground">{a.full_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{a.email}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{a.phone || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              a.checked_in
                                ? 'bg-success/10 text-success'
                                : 'bg-warning/10 text-warning'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${a.checked_in ? 'bg-success' : 'bg-warning'}`} />
                              {a.checked_in ? 'Checked In' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                            {a.checked_in_at
                              ? new Date(a.checked_in_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {a.checked_in ? (
                                <button
                                    onClick={() => handleCheckIn(a)}
                                    disabled={processing === a.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-lg text-xs font-medium hover:bg-error/20 transition-colors disabled:opacity-50"
                                >
                                    {processing === a.id ? (
                                    <div className="w-3 h-3 border-2 border-error border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                    <Icon name="UserX" size={13} />
                                    )}
                                    Undo
                                </button>
                                ) : (
                              <button
                                onClick={() => handleCheckIn(a)}
                                disabled={processing === a.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                              >
                                {processing === a.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Icon name="UserCheck" size={13} />
                                )}
                                Check In
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                Showing {filtered.length} of {attendees.length} attendees
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendeeList;