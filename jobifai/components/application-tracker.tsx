import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface JobApplication {
  id: string;
  title: string;
  company: string;
  status: string;
  applied_date: string;
}

export function ApplicationTracker() {
  const { isLoaded, userId } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isLoaded || !userId) return;

      try {
        const response = await fetch(`/api/jobs`);
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, [isLoaded, userId]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Applications</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.company}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app.applied_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/jobs/${app.id}`}>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                      View
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}