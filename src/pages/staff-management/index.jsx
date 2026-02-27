import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import QuickActions from '../../components/ui/QuickActions';
import StatusIndicator from '../../components/ui/StatusIndicator';
import StaffCard from './components/StaffCard';
import AddStaffModal from './components/AddStaffModal';
import ActivityLog from './components/ActivityLog';
import StatsOverview from './components/StatsOverview';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const StaffManagement = () => {
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState([
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@conference.com",
    role: "admin",
    sessionStatus: "active",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14da91c34-1763294780479.png",
    avatarAlt: "Professional headshot of woman with shoulder-length brown hair wearing navy blazer and white blouse",
    lastActivity: {
      action: "Checked in attendee: John Smith",
      timestamp: "2026-02-27 09:45:12"
    }
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@conference.com",
    role: "staff",
    sessionStatus: "active",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f111493f-1763295642622.png",
    avatarAlt: "Professional headshot of Asian man with short black hair wearing gray suit and blue tie",
    lastActivity: {
      action: "Checked in attendee: Emily Davis",
      timestamp: "2026-02-27 09:52:34"
    }
  },
  {
    id: 3,
    name: "Jessica Martinez",
    email: "jessica.martinez@conference.com",
    role: "staff",
    sessionStatus: "active",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1631c1677-1763295642190.png",
    avatarAlt: "Professional headshot of Hispanic woman with long dark hair wearing burgundy blouse",
    lastActivity: {
      action: "Checked in attendee: Robert Wilson",
      timestamp: "2026-02-27 10:01:18"
    }
  },
  {
    id: 4,
    name: "David Thompson",
    email: "david.thompson@conference.com",
    role: "staff",
    sessionStatus: "inactive",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1cef3e3c2-1763295620422.png",
    avatarAlt: "Professional headshot of man with short blonde hair wearing charcoal suit and striped tie",
    lastActivity: {
      action: "Logged out",
      timestamp: "2026-02-27 08:30:45"
    }
  },
  {
    id: 5,
    name: "Amanda Rodriguez",
    email: "amanda.rodriguez@conference.com",
    role: "staff",
    sessionStatus: "active",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14da91c34-1763294780479.png",
    avatarAlt: "Professional headshot of woman with curly brown hair wearing teal blazer and pearl necklace",
    lastActivity: {
      action: "Checked in attendee: Lisa Anderson",
      timestamp: "2026-02-27 09:38:22"
    }
  }]
  );

  const [recentActivities, setRecentActivities] = useState([
  {
    id: 1,
    staffName: "Jessica Martinez",
    action: "Checked in attendee: Robert Wilson",
    timestamp: "2026-02-27 10:01:18"
  },
  {
    id: 2,
    staffName: "Michael Chen",
    action: "Checked in attendee: Emily Davis",
    timestamp: "2026-02-27 09:52:34"
  },
  {
    id: 3,
    staffName: "Sarah Johnson",
    action: "Checked in attendee: John Smith",
    timestamp: "2026-02-27 09:45:12"
  },
  {
    id: 4,
    staffName: "Amanda Rodriguez",
    action: "Checked in attendee: Lisa Anderson",
    timestamp: "2026-02-27 09:38:22"
  },
  {
    id: 5,
    staffName: "Michael Chen",
    action: "Logged in to system",
    timestamp: "2026-02-27 09:15:00"
  }]
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const stats = {
    totalStaff: staffMembers?.length,
    activeSessions: staffMembers?.filter((s) => s?.sessionStatus === 'active')?.length,
    admins: staffMembers?.filter((s) => s?.role === 'admin')?.length,
    checkInsToday: 247
  };

  const handleAddStaff = (newStaff) => {
    setStaffMembers((prev) => [...prev, newStaff]);
    setRecentActivities((prev) => [
    {
      id: Date.now(),
      staffName: "System",
      action: `Added new staff member: ${newStaff?.name}`,
      timestamp: new Date()?.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })?.replace(',', '')
    },
    ...prev]
    );
  };

  const handleRemoveStaff = (staffId) => {
    const staff = staffMembers?.find((s) => s?.id === staffId);
    if (staff && window.confirm(`Are you sure you want to remove ${staff?.name}?`)) {
      setStaffMembers((prev) => prev?.filter((s) => s?.id !== staffId));
      setRecentActivities((prev) => [
      {
        id: Date.now(),
        staffName: "System",
        action: `Removed staff member: ${staff?.name}`,
        timestamp: new Date()?.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })?.replace(',', '')
      },
      ...prev]
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(Math.random() > 0.1 ? 'connected' : 'disconnected');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
              <QuickActions userName="Sarah Johnson" userRole="admin" />
            </div>
          </div>

          <StatsOverview stats={stats} />

          <div className="mt-5 md:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
              Staff Directory ({staffMembers?.length})
            </h2>
            <Button
              variant="default"
              iconName="UserPlus"
              iconPosition="left"
              onClick={() => setIsAddModalOpen(true)}>
              Add Staff Member
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
              {staffMembers?.map((staff) =>
              <StaffCard
                key={staff?.id}
                staff={staff}
                onRemoveStaff={handleRemoveStaff} />
              )}
            </div>

            <div className="lg:col-span-1">
              <ActivityLog activities={recentActivities} />
            </div>
          </div>

          <div className="mt-6 md:mt-12 p-3 sm:p-4 md:p-6 bg-muted/50 border border-border rounded-xl">
            <div className="flex items-start gap-3 md:gap-4">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold text-foreground mb-1 sm:mb-2">
                  Session Management
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 sm:mb-3 md:mb-4">
                  Active sessions are automatically monitored. Staff members are logged out after 8 hours of inactivity for security purposes.
                </p>
                <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success">
                    <Icon name="CheckCircle" size={14} />
                    Auto-logout enabled
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary">
                    <Icon name="Shield" size={14} />
                    Role-based access
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStaff={handleAddStaff}
      />
    </div>
  );

};

export default StaffManagement;