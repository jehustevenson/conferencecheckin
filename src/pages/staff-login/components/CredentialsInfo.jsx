import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const CredentialsInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const credentials = [
    {
      role: 'Administrator',
      email: 'admin@conference.com',
      password: 'Admin@2026',
      icon: 'UserCog',
      color: 'var(--color-primary)'
    },
    {
      role: 'Check-In Staff',
      email: 'staff1@conference.com',
      password: 'Staff@2026',
      icon: 'User',
      color: 'var(--color-accent)'
    },
    {
      role: 'Check-In Staff',
      email: 'staff2@conference.com',
      password: 'Staff@2026',
      icon: 'User',
      color: 'var(--color-accent)'
    }
  ];

  return (
    <div className="w-full bg-muted/50 border border-border rounded-lg md:rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-muted/70 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <Icon name="Info" size={20} color="var(--color-primary)" />
          <span className="text-sm md:text-base font-medium text-foreground">
            Demo Credentials
          </span>
        </div>
        <Icon 
          name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
          size={20} 
          color="var(--color-muted-foreground)" 
        />
      </button>
      {isExpanded && (
        <div className="p-3 md:p-4 pt-0 space-y-3 md:space-y-4">
          {credentials?.map((cred, index) => (
            <div 
              key={index}
              className="p-3 md:p-4 bg-card border border-border rounded-lg md:rounded-xl space-y-2"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Icon name={cred?.icon} size={18} color={cred?.color} />
                <span className="text-sm md:text-base font-semibold text-foreground">
                  {cred?.role}
                </span>
              </div>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground min-w-[60px] md:min-w-[70px]">Email:</span>
                  <span className="text-foreground font-medium break-all">{cred?.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground min-w-[60px] md:min-w-[70px]">Password:</span>
                  <span className="text-foreground font-medium">{cred?.password}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CredentialsInfo;