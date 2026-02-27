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
import { supabase } from '../../lib/supabase';
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
  const [staffActivities, setStaffActivities] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

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

  const loadStaffActivity = async () => {
    const { data, error } = await supabase
      .from('check_in_logs')
      .select(`
        id,
        action,
        created_at,
        user_profiles!staff_id(full_name),
        participants!participant_id(full_name, ticket_type)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setStaffActivities(data.map(log => ({
        id: log.id,
        staffName: log.user_profiles?.full_name || 'Unknown Staff',
        staffAvatar: null,
        staffAvatarAlt: '',
        attendeeName: log.participants?.full_name || 'Unknown Attendee',
        ticketType: log.participants?.ticket_type || 'N/A',
        timestamp: new Date(log.created_at),
      })));
    }
  };

  const loadHourlyData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('check_in_logs')
      .select('created_at')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: true });

    if (!error && data) {
      const hourCounts = {};
      data.forEach(log => {
        const hour = new Date(log.created_at).getHours();
        const label = hour === 0 ? '12 AM'
          : hour < 12 ? `${hour} AM`
          : hour === 12 ? '12 PM'
          : `${hour - 12} PM`;
        hourCounts[label] = (hourCounts[label] || 0) + 1;
      });

      setHourlyData(Object.entries(hourCounts).map(([hour, checkedIn]) => ({ hour, checkedIn })));
    }
  };

  useEffect(() => {
    loadMetrics();
    loadStaffActivity();
    loadHourlyData();

    const updateInterval = setInterval(() => {
      setLastUpdate(new Date());
      loadMetrics();
      loadStaffActivity();
      loadHourlyData();
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
              <QuickActions
                userName={user?.user_metadata?.full_name || 'Admin User'}
                userRole="admin"
              />
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
              trendValue={undefined}
            />
            <MetricCard
              title="Checked In"
              value={metricsLoading ? '...' : dashboardMetrics?.checkedIn?.toLocaleString()}
              subtitle="Successfully verified"
              icon="CheckCircle2"
              trend="up"
              trendValue=""
              color="success"
            />
            <MetricCard
              title="Remaining"
              value={metricsLoading ? '...' : dashboardMetrics?.remaining?.toLocaleString()}
              subtitle="Pending check-in"
              icon="Clock"
              color="warning"
              trend={undefined}
              trendValue={undefined}
            />
            <MetricCard
              title="Completion"
              value={metricsLoading ? '...' : `${dashboardMetrics?.percentage}%`}
              subtitle="Overall progress"
              icon="TrendingUp"
              trend="up"
              trendValue=""
              color="success"
            />
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
                  className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors group"
                >
                  <span className="text-sm md:text-base font-medium text-foreground">Manage Staff</span>
                  <div className="w-8 h-8 bg-primary/10 group-hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-primary">→</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/attendee-search-backup')}
                  className="w-full flex items-center justify-between p-4 bg-success/5 hover:bg-success/10 rounded-xl transition-colors group"
                >
                  <span className="text-sm md:text-base font-medium text-foreground">Search Attendees</span>
                  <div className="w-8 h-8 bg-success/10 group-hover:bg-success/20 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-success">→</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/csv-import')}
                  className="w-full flex items-center justify-between p-4 bg-accent/5 hover:bg-accent/10 rounded-xl transition-colors group"
                >
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