import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export function UserProfileButton() {
  return (
    <Button variant="ghost" className="flex items-center gap-2">
      <UserCircle className="h-5 w-5" />
      <span>Profile</span>
    </Button>
  );
}