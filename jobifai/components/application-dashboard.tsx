import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useUserStore } from '@/lib/userStore';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { motion } from 'framer-motion';
import { ChartOptions } from 'chart.js';

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

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Application Status Distribution',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const colorPalette = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
  ];

  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Status Breakdown',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Applications Over Time',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6 space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Application Dashboard</h2>
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-blue-50 rounded-lg p-4 mb-6"
      >
        <p className="text-xl font-semibold text-blue-800">Total Applications: {applications.length}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-semibold mb-2">Status Distribution</h3>
          <Bar options={chartOptions} data={chartData} />
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-semibold mb-2">Status Breakdown</h3>
          <Pie data={pieChartData} options={pieChartOptions} />
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-semibold mb-2">Applications Over Time</h3>
          <Line options={lineChartOptions} data={lineChartData} />
        </motion.div>
      </div>
    </motion.div>
  );
}
