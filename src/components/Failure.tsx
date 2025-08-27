import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Failure() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Payment Failed</h1>
        <p className="text-gray-600 dark:text-gray-300">{message || 'Your payment has failed. Please try again.'}</p>
      </div>
    </div>
  );
}
