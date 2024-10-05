import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface JobApplication {
  id: string;
  title: string;
  company: string;
  status: string;
  applied_date: string;
}

export function ApplicationTracker() {
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Applications</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Status</th>
            <th>Applied Date</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.title}</td>
              <td>{app.company}</td>
              <td>{app.status}</td>
              <td>{new Date(app.applied_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}