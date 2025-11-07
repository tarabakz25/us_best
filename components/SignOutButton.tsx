'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
        router.push('/');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      ログアウト
    </Button>
  );
}

