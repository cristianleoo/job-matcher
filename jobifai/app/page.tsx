import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to JobifAI</h1>
      <p className="mb-4">Your AI-powered job search assistant</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/chat" className="p-4 border rounded-lg hover:bg-gray-100">
          <h2 className="text-xl font-bold">Chat with AI Assistant</h2>
          <p>Get personalized job search advice</p>
        </Link>
        <Link href="/job-search" className="p-4 border rounded-lg hover:bg-gray-100">
          <h2 className="text-xl font-bold">Job Search</h2>
          <p>Search and track job opportunities</p>
        </Link>
        <Link href="/applications" className="p-4 border rounded-lg hover:bg-gray-100">
          <h2 className="text-xl font-bold">Application Tracker</h2>
          <p>Manage your job applications</p>
        </Link>
        <Link href="/dashboard" className="p-4 border rounded-lg hover:bg-gray-100">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <p>View insights about your job search</p>
        </Link>
      </div>
    </div>
  );
}
