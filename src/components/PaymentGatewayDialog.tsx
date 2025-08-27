import React from 'react';

interface PaymentGatewayDialogProps {
  onClose: () => void;
  onSelectGateway: (gateway: string) => void;
}

export default function PaymentGatewayDialog({ onClose, onSelectGateway }: PaymentGatewayDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Select Payment Gateway</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <button 
            onClick={() => onSelectGateway('esewa')} 
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Pay with eSewa
          </button>
          <button 
            onClick={() => onSelectGateway('khalti')} 
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            Pay with Khalti
          </button>
        </div>
      </div>
    </div>
  );
}
