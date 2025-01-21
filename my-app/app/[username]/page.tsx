import { Header } from '../../components/Header';
import { Posts } from '../../components/Posts';
import { UserProfile } from '@/components/UserProfile';

export default function Profile({ params }: { params: { username: string } }) {
  return (
     <div className="max-w-4xl mx-auto px-4 py-8">
      <UserProfile username={params.username} />
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">Posts</h2>
        <Posts username={params.username} />
      </div>
    </div>
  );
}

