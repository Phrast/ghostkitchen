import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function TreasuryChart({ transactions }) {
  const dateMap = {};
  for (const t of transactions) {
    if (!dateMap[t.date]) dateMap[t.date] = { sales: 0, purchases: 0 };
    if (t.type === 'sale') dateMap[t.date].sales += t.total;
    else dateMap[t.date].purchases += t.total;
  }

  const dates = Object.keys(dateMap).sort();
  const salesData = dates.map(d => dateMap[d].sales);
  const purchasesData = dates.map(d => dateMap[d].purchases);
  const profitData = dates.map(d => dateMap[d].sales - dateMap[d].purchases);

  const data = {
    labels: dates.map(formatDate),
    datasets: [
      {
        label: 'Sales',
        data: salesData,
        backgroundColor: 'rgba(46, 213, 115, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Purchases',
        data: purchasesData,
        backgroundColor: 'rgba(255, 71, 87, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Profit',
        data: profitData,
        backgroundColor: 'rgba(255, 165, 2, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#eee', usePointStyle: true, padding: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}$`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#aaa' },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#aaa', callback: (v) => v + '$' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  if (dates.length === 0) {
    return <p className="empty-message">No transactions yet.</p>;
  }

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
