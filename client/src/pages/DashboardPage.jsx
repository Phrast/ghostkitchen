import { useState, useEffect } from 'react';
import { getStats, getMargins } from '../api/dashboardApi';
import TreasuryChart from '../components/dashboard/TreasuryChart';
import ExpenseBreakdown from '../components/dashboard/ExpenseBreakdown';
import MarginTable from '../components/dashboard/MarginTable';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [margins, setMargins] = useState([]);

  useEffect(() => {
    getStats().then(res => setStats(res.data));
    getMargins().then(res => setMargins(res.data.margins));
  }, []);

  if (!stats) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <span className="treasury-badge">{stats.treasury}$</span>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Treasury Activity</h3>
          <TreasuryChart transactions={stats.transactions} />
        </div>
        <div className="chart-card">
          <h3>Sales vs Purchases</h3>
          <ExpenseBreakdown totals={stats.totals} />
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Margin per Recipe</h3>
        <MarginTable margins={margins} />
      </div>
    </div>
  );
}
