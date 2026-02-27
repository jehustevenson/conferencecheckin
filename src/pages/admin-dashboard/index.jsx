import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import StatusIndicator from '../../components/ui/StatusIndicator';
import QuickActions from '../../components/ui/QuickActions';
import MetricCard from './components/MetricCard';
import TicketTypeBreakdown from './components/TicketTypeBreakdown';
import StaffActivityMonitor from './components/StaffActivityMonitor';
import CheckInProgressChart from './components/CheckInProgressChart';
import LiveUpdateIndicator from './components/LiveUpdateIndicator';
import { getDashboardMetrics } from '../../services/participantService';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalRegistered: 0,
    checkedIn: 0,
    remaining: 0,
    percentage: 0
  });
  const [ticketTypes, setTicketTypes] = useState([]);

  const staffActivities = [
  {
    id: 1,
    staffName: "Sarah Johnson",
    staffAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1fb6cf439-1763299224286.png",
    staffAvatarAlt: "Professional woman with brown hair wearing blue blazer smiling at camera in office setting",
    attendeeName: "Michael Chen",
    ticketType: "VIP Pass",
    timestamp: new Date(Date.now() - 120000)
  },
  {
    id: 2,
    staffName: "David Martinez",
    staffAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17b3c9c38-1763299336236.png",
    staffAvatarAlt: "Hispanic man with short black hair in navy suit smiling professionally against gray background",
    attendeeName: "Emily Rodriguez",
    ticketType: "General Admission",
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: 3,
    staffName: "Jessica Lee",
    staffAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10d60e496-1763295319842.png",
    staffAvatarAlt: "Asian woman with long dark hair wearing white blouse in bright office environment",
    attendeeName: "Robert Thompson",
    ticketType: "Student Pass",
    timestamp: new Date(Date.now() - 480000)
  },
  {
    id: 4,
    staffName: "James Wilson",
    staffAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f08f4a30-1763296200964.png",
    staffAvatarAlt: "Caucasian man with beard wearing casual gray shirt outdoors with natural lighting",
    attendeeName: "Amanda Foster",
    ticketType: "Speaker Pass",
    timestamp: new Date(Date.now() - 600000)
  },
  {
    id: 5,
    staffName: "Maria Garcia",
    staffAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10bbbf135-1763294543564.png",
    staffAvatarAlt: "Hispanic woman with curly brown hair wearing professional attire in modern office space",
    attendeeName: "Daniel Park",
    ticketType: "VIP Pass",
    timestamp: new Date(Date.now() - 720000)
  }];

  const hourlyData = [
  { hour: "8 AM", checkedIn: 45 },
  { hour: "9 AM", checkedIn: 128 },
  { hour: "10 AM", checkedIn: 215 },
  { hour: "11 AM", checkedIn: 187 },
  { hour: "12 PM", checkedIn: 156 },
  { hour: "1 PM", checkedIn: 98 },
  { hour: "2 PM", checkedIn: 63 }];

  const loadMetrics = async () => {
    const { data, error } = await getDashboardMetrics();
    if (!error && data) {
      setDashboardMetrics({
        totalRegistered: data?.totalRegistered,
        checkedIn: data?.checkedIn,
        remaining: data?.remaining,
        percentage: data?.percentage,
      });
      setTicketTypes(data?.ticketTypes || []);
    }
    setMetricsLoading(false);
  };

  useEffect(() => {
    loadMetrics();

    const updateInterval = setInterval(() => {
      setLastUpdate(new Date());
      loadMetrics();
    }, 30000);

    const connectionCheck = setInterval(() => {
      const isOnline = Math.random() > 0.05;
      setConnectionStatus(isOnline ? 'connected' : 'disconnected');
    }, 10000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(connectionCheck);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />
      <div className="pt-14 sm:pt-16 md:pt-20 lg:pt-24">
        <div className="max-w-[1440px] mx-auto px-4 py-6 md:py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Real-time conference check-in monitoring and analytics
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <LiveUpdateIndicator lastUpdate={lastUpdate} />
              <StatusIndicator connectionStatus={connectionStatus} />
              <QuickActions userName={user?.user_metadata?.full_name || 'Admin User'} userRole="admin" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <MetricCard
              title="Total Registered"
              value={metricsLoading ? '...' : dashboardMetrics?.totalRegistered?.toLocaleString()}
              subtitle="Conference attendees"
              icon="Users"
              color="primary"
              trend={undefined}
              trendValue={undefined} />
            
            <MetricCard
              title="Checked In"
              value={metricsLoading ? '...' : dashboardMetrics?.checkedIn?.toLocaleString()}
              subtitle="Successfully verified"
              icon="CheckCircle2"
              trend="up"
              trendValue="+12%"
              color="success" />
            
            <MetricCard
              title="Remaining"
              value={metricsLoading ? '...' : dashboardMetrics?.remaining?.toLocaleString()}
              subtitle="Pending check-in"
              icon="Clock"
              color="warning"
              trend={undefined}
              trendValue={undefined} />
            
            <MetricCard
              title="Completion"
              value={metricsLoading ? '...' : `${dashboardMetrics?.percentage}%`}
              subtitle="Overall progress"
              icon="TrendingUp"
              trend="up"
              trendValue="+5.2%"
              color="success" />
            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2">
              <CheckInProgressChart hourlyData={hourlyData} />
            </div>
            <div>
              <TicketTypeBreakdown ticketTypes={ticketTypes?.length > 0 ? ticketTypes : []} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <StaffActivityMonitor staffActivities={staffActivities} />
            
            <div className="bg-card rounded-2xl p-4 md:p-6 lg:p-8 shadow-elevation-2 border border-border">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/staff-management')}
                  className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors group">
                  
                  <span className="text-sm md:text-base font-medium text-foreground">Manage Staff</span>
                  <div className="w-8 h-8 bg-primary/10 group-hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-primary">→</span>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/attendee-search-backup')}
                  className="w-full flex items-center justify-between p-4 bg-success/5 hover:bg-success/10 rounded-xl transition-colors group">
                  
                  <span className="text-sm md:text-base font-medium text-foreground">Search Attendees</span>
                  <div className="w-8 h-8 bg-success/10 group-hover:bg-success/20 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-success">→</span>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/csv-import')}
                  className="w-full flex items-center justify-between p-4 bg-accent/5 hover:bg-accent/10 rounded-xl transition-colors group">
                  
                  <span className="text-sm md:text-base font-medium text-foreground">Import Participants (CSV)</span>
                  <div className="w-8 h-8 bg-accent/10 group-hover:bg-accent/20 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-accent">→</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default AdminDashboard;