import { UserProfileForm } from '@/components/user-profile-form';

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Your JobifAI Profile</h1>
      <UserProfileForm />
    </div>
  );
}