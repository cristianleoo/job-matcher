import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface JobApplication {
  id: string;
  status: string;
  applied_date: string;
}

export function ApplicationDashboard() {
  const { userId } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`/api/jobs?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    if (userId) {
      fetchApplications();
    }
  }, [userId]);

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
      <div className="w-full h-64">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
}