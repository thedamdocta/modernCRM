import React, { useState, useEffect } from 'react';

interface DashboardProps {
  title?: string;
}

interface DashboardData {
  totalContacts: number;
  totalOpportunities: number;
  totalRevenue: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ title = 'CRM Dashboard' }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setData({
        totalContacts: 1247,
        totalOpportunities: 89,
        totalRevenue: 2450000,
        recentActivities: [
          { id: '1', type: 'contact', description: 'New contact added: John Doe', timestamp: '2 hours ago' },
          { id: '2', type: 'opportunity', description: 'Opportunity updated: ABC Corp Deal', timestamp: '4 hours ago' },
          { id: '3', type: 'meeting', description: 'Meeting scheduled with Jane Smith', timestamp: '1 day ago' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>{title}</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Contacts</h3>
          <p className="stat-number">{data?.totalContacts.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Opportunities</h3>
          <p className="stat-number">{data?.totalOpportunities}</p>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-number">${data?.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="recent-activities">
        <h2>Recent Activities</h2>
        <div className="activities-list">
          {data?.recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-content">
                <p>{activity.description}</p>
                <span className="activity-time">{activity.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .dashboard {
          padding: var(--twenty-spacing-6);
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .dashboard h1 {
          margin-bottom: var(--twenty-spacing-6);
          font-size: var(--twenty-font-size-2xl);
          font-weight: var(--twenty-font-weight-bold);
          color: var(--twenty-color-gray-90);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--twenty-spacing-4);
          margin-bottom: var(--twenty-spacing-8);
        }
        
        .stat-card {
          background: var(--twenty-color-gray-0);
          border: 1px solid var(--twenty-color-gray-20);
          border-radius: var(--twenty-border-radius-lg);
          padding: var(--twenty-spacing-6);
          text-align: center;
          box-shadow: var(--twenty-shadow-sm);
        }
        
        .stat-card h3 {
          margin-bottom: var(--twenty-spacing-2);
          font-size: var(--twenty-font-size-sm);
          font-weight: var(--twenty-font-weight-medium);
          color: var(--twenty-color-gray-70);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-number {
          font-size: var(--twenty-font-size-2xl);
          font-weight: var(--twenty-font-weight-bold);
          color: var(--twenty-color-blue-60);
          margin: 0;
        }
        
        .recent-activities {
          background: var(--twenty-color-gray-0);
          border: 1px solid var(--twenty-color-gray-20);
          border-radius: var(--twenty-border-radius-lg);
          padding: var(--twenty-spacing-6);
          box-shadow: var(--twenty-shadow-sm);
        }
        
        .recent-activities h2 {
          margin-bottom: var(--twenty-spacing-4);
          font-size: var(--twenty-font-size-lg);
          font-weight: var(--twenty-font-weight-semibold);
          color: var(--twenty-color-gray-90);
        }
        
        .activities-list {
          space-y: var(--twenty-spacing-3);
        }
        
        .activity-item {
          padding: var(--twenty-spacing-3);
          border-left: 3px solid var(--twenty-color-blue-60);
          background: var(--twenty-color-gray-10);
          border-radius: var(--twenty-border-radius-sm);
          margin-bottom: var(--twenty-spacing-3);
        }
        
        .activity-content p {
          margin: 0 0 var(--twenty-spacing-1) 0;
          font-size: var(--twenty-font-size-base);
          color: var(--twenty-color-gray-90);
        }
        
        .activity-time {
          font-size: var(--twenty-font-size-sm);
          color: var(--twenty-color-gray-50);
        }
        
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--twenty-color-gray-20);
          border-top: 3px solid var(--twenty-color-blue-60);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: var(--twenty-spacing-4);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;