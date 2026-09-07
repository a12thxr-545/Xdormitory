'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserPortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
}
