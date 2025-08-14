import React, { useState } from 'react';

interface UpdateProfileProps {
  setCurrentPage: (page: string) => void;
}

export default function UpdateProfile({ setCurrentPage }: UpdateProfileProps) {
  const [selection, setSelection] = useState<'name' | 'password' | null>(null);

  const renderSelection = () => {
    if (selection === 'name') {
      return (
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Change Name
          </label>
          <input
            type="text"
            id="name"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Enter your new name"
          />
        </div>
      );
    }
    if (selection === 'password') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="old-password"
              className="block text-sm font-medium text-gray-700"
            >
              Old Password
            </label>
            <input
              type="password"
              id="old-password"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Enter your old password"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Enter your new password"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm-password"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Repeat your new password"
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Update Profile</h1>
            <p className="text-gray-600">
              Choose an option to update.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {!selection ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setSelection('name')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Change Name
                </button>
                <button
                  onClick={() => setSelection('password')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Change Password
                </button>
              </div>
            ) : (
              renderSelection()
            )}
          </div>

          <div className="text-center">
            <button
              onClick={() => selection ? setSelection(null) : setCurrentPage('profile')}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors mr-4"
            >
              {selection ? 'Back' : 'Cancel'}
            </button>
            {selection && (
              <button
                onClick={() => setCurrentPage('profile')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}