import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function RecentApplications() {
  // This is a placeholder. In a real app, you'd fetch this data from your backend.
  const applications = [
    { id: 1, company: "TechCorp", position: "Frontend Developer", status: "Applied" },
    { id: 2, company: "DataSystems", position: "Data Analyst", status: "Interview Scheduled" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {applications.map((app) => (
            <li key={app.id} className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{app.position}</p>
                <p className="text-sm text-gray-500">{app.company}</p>
              </div>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {app.status}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}