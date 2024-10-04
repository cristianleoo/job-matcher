import { JobSearch } from "@/components/job-search";
import { RecentApplications } from "@/components/recent-applications";
import { FloatingChatButton } from "@/components/floating-chat-button";

export default function Home() {
  return (
    <div className="min-h-screen p-8 font-sans relative">
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h1 className="text-3xl font-bold mb-4">Welcome to JobifAI</h1>
          <p className="mb-6">Your AI-powered job search assistant</p>
          <JobSearch />
        </section>
        <section>
          <RecentApplications />
        </section>
      </main>

      <FloatingChatButton />
    </div>
  );
}
