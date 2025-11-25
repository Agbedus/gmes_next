'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    // redirect to Phase II page where the Impact Reports tab now lives
    router.replace('/phase_two');
  }, [router]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Reports moved</h1>
        <p className="mt-2 text-sm text-zinc-700">The consolidated consortium reports have been moved into the Phase II dashboard under "Impact Reports". You will be redirected shortly.</p>
      </div>
    </div>
  );
}