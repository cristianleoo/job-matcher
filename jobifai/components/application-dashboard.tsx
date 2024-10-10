import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useUserStore } from '@/lib/userStore';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';

// Register all necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

interface JobApplication {
  id: string;
  status: string;
  applied_date: string;
}

export function ApplicationDashboard() {
  const { userId } = useAuth();
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!supabaseUserId) {
        console.error('No supabaseUserId found');
        return;
      }

      try {
        const response = await fetch(`/api/jobs?supabaseUserId=${supabaseUserId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    if (userId && supabaseUserId) {
      fetchApplications();
    }
  }, [userId, supabaseUserId]);

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Number of Applications',
        data: Object.values(statusCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Pie chart data
  const pieChartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
      },
    ],
  };

  // Line chart data (for applications over time)
  const applicationsOverTime = applications.reduce((acc, app) => {
    const date = new Date(app.applied_date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lineChartData = {
    labels: Object.keys(applicationsOverTime),
    datasets: [
      {
        label: 'Applications Over Time',
        data: Object.values(applicationsOverTime),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  // Funnel chart data
  const funnelData = {
    labels: ['Applied', 'Interview', 'Offer', 'Rejected'],
    datasets: [
      {
        label: 'Application Flow',
        data: [
          statusCounts['Applied'] || 0,
          statusCounts['Interview'] || 0,
          statusCounts['Offer'] || 0,
          statusCounts['Rejected'] || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Application Status Distribution',
      },
    },
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Application Dashboard</h2>
      <div className="mb-4">
        <p>Total Applications: {applications.length}</p>
      </div>

      {/* Responsive layout for charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Bar Chart for Application Status Distribution */}
        <div className="w-full h-64">
          <Bar options={options} data={chartData} />
        </div>

        {/* Pie Chart for Application Status Distribution */}
        <div className="w-full h-64">
          <Pie data={pieChartData} />
        </div>

        {/* Line Chart for Applications Over Time */}
        <div className="w-full h-64">
          <Line data={lineChartData} />
        </div>

        {/* Funnel Chart for Application Flow
        <div className="w-full h-64">
          <Bar options={{ ...options, plugins: { title: { display: true, text: 'Application Flow (Funnel Chart)' } } }} data={funnelData} />
        </div> */}
      </div>
    </div>
  );
}