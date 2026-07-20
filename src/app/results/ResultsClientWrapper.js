'use client';

import dynamic from 'next/dynamic';

// Dynamically import ResultsScreen (which uses useState, useRouter, etc.)
const ResultsScreen = dynamic(() => import('../../screens/ResultsScreen'), {
  ssr: false,
});

export default function ResultsClientWrapper() {
  return <ResultsScreen />;
}
