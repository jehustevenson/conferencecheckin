import React, { useState, useEffect } from 'react';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import QuickActions from '../../components/ui/QuickActions';
import StatusIndicator from '../../components/ui/StatusIndicator';
import StaffCard from './components/StaffCard';
import AddStaffModal from './components/AddStaffModal';
import ActivityLog from './components/ActivityLog';
import StatsOverview from './components/StatsOverview';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const StaffManagement = () => {
  const { user, userProfile } = useAuth();
  const [staffMembers, setStaffMembers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [loading, setLoading] = useState(true);

  // Fetch real staff from Supabase
  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setStaffMembers(data.map(s => ({
        id: s.id,
        name: s.full_name,
        email: s.email,
        role: s.role,
        sessionStatus: s.is_active ? 'active' : 'inactive',
        lastActivity: { action: 'Account created', timestamp: s.created_at }
      })));
    }
    setLoading(false);
  };

  // Fetch real activity from check_in_logs
  const fetchActivity = async () => {
    const { data, error } = await supabase
      .from('check_in_logs')
      .select('id, action, created_at, staff_id, user_profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentActivities(data.map(log => ({
        id: log.id,
        staffName: log.user_profiles?.full_name || 'Unknown',
        action: log.action,
        timestamp: new Date(log.created_at).toLocaleString()
      })));
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchActivity();

    const interval = setInterval(() => {
      setConnectionStatus(Math.random() > 0.1 ? 'connected' : 'disconnected');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalStaff: staffMembers.length,
    activeSessions: staffMembers.filter(s => s.sessionStatus === 'active').length,
    admins: staffMembers.filter(s => s.role === 'admin').length,
    checkInsToday: 0
  };

  const handleAddStaff = (newStaff) => {
    fetchStaff(); // Refresh from DB instead of local state
  };

 const handleRemoveStaff = async (staffId) => {
  const staff = staffMembers.find(s => s.id === staffId);
  if (staff && window.confirm(`Are you sure you want to remove ${staff.name}?`)) {
    const { error } = await supabase.rpc('delete_staff_user', { user_id: staffId });

    if (!error) {
      fetchStaff();
    } else {
      alert('Failed to remove staff member: ' + error.message);
    }
  }
};

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />
      <div className="pt-14 sm:pt-16 md:pt-20">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-6 mb-5 md:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">
                Staff Management
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                Manage check-in personnel and monitor system access
              </p>
            </div>
            <div className="flex flex-row items-center gap-2 sm:gap-3 md:gap-4">
              <StatusIndicator connectionStatus={connectionStatus} />
              <QuickActions
                userName={userProfile?.full_name || user?.user_metadata?.full_name || 'Admin'}
                userRole="admin"
              />
            </div>
          </div>

          <StatsOverview stats={stats} />

          <div className="mt-5 md:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
              Staff Directory ({staffMembers.length})
            </h2>
            <Button
              variant="default"
              iconName="UserPlus"
              iconPosition="left"
              onClick={() => setIsAddModalOpen(true)}>
              Add Staff Member
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : staffMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No staff members found. Add one to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                {staffMembers.map((staff) =>
                  <StaffCard
                    key={staff.id}
                    staff={staff}
                    onRemoveStaff={handleRemoveStaff}
                  />
                )}
              </div>
              <div className="lg:col-span-1">
                <ActivityLog activities={recentActivities} />
              </div>
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <AddStaffModal
          onClose={() => setIsAddModalOpen(false)}
          onAddStaff={handleAddStaff}
        />
      )}
    </div>
  );
};

export default StaffManagement;