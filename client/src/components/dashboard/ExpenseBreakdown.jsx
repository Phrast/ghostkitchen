import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseBreakdown({ totals }) {
  const salesTotal = totals.find(t => t.type === 'sale')?.total || 0;
  const purchasesTotal = totals.find(t => t.type === 'purchase')?.total || 0;

  if (salesTotal === 0 && purchasesTotal === 0) {
    return <p className="empty-message">No data yet.</p>;
  }

  const data = {
    labels: ['Sales', 'Purchases'],
    datasets: [{
      data: [salesTotal, purchasesTotal],
      backgroundColor: ['#2ed573', '#ff4757'],
      borderColor: ['#2ed573', '#ff4757'],
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#eee' } },
    },
  };

  return <Doughnut data={data} options={options} />;
}
