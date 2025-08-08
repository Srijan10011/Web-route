import React from 'react';

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentPage }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
          onClick={() => setCurrentPage('admin-orders')}
        >
          <h2 className="text-xl font-semibold mb-2">Manage Orders</h2>
          <p className="text-gray-600">View, track, and edit customer orders.</p>
        </div>
        {/* Add more admin sections here as needed */}
      </div>
    </div>
  );
};

export default AdminDashboard;
