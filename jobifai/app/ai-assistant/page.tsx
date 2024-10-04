import { AIAssistant } from "@/components/ai-assistant";

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8">AI Assistant</h1>
      <div className="max-w-3xl mx-auto">
        <AIAssistant />
      </div>
    </div>
  );
}