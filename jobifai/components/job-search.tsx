import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function JobSearch() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Find Your Dream Job</h2>
      <div className="flex gap-2">
        <Input placeholder="Job title, keywords, or company" className="flex-grow" />
        <Button>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    </div>
  );
}