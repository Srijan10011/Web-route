import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

const OrderList = ({ orders }) => (
  <div className="space-y-4">
    {orders.map((order) => (
      <div
        key={order.id}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-lg">Order #{order.order_number}</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : order.status === 'processing'
                ? 'bg-blue-100 text-blue-800'
                : order.status === 'shipped'
                ? 'bg-purple-100 text-purple-800'
                : order.status === 'delivered'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-2">
          Date: {new Date(order.order_date).toLocaleDateString()}
        </p>
        <p className="text-gray-800 font-bold text-xl mb-2">
          Total: ${parseFloat(order.total_amount).toFixed(2)}
        </p>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <p className="font-medium text-gray-700">Items:</p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: any, idx: number) => (
                <li key={idx}>
                  {item.name} (x{item.quantity}) - ${item.price.toFixed(2)}
                </li>
              ))
            ) : (
              <li>No items listed</li>
            )}
          </ul>
        </div>
      </div>
    ))}
  </div>
);

const OrderTabs = ({ orders }) => {
  const [activeTab, setActiveTab] = useState('pending');

  const pendingOrders = orders.filter(
    (order) => order.status === 'pending' || order.status === 'processing'
  );

  const completedOrders = orders.filter(
    (order) => order.status === 'shipped' || order.status === 'delivered'
  );

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'pending'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-500'
          }`}
        >
          Pending ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'completed'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-500'
          }`}
        >
          Completed ({completedOrders.length})
        </button>
      </div>

      {activeTab === 'pending' &&
        (pendingOrders.length > 0 ? (
          <OrderList orders={pendingOrders} />
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pending orders found.</p>
          </div>
        ))}

      {activeTab === 'completed' &&
        (completedOrders.length > 0 ? (
          <OrderList orders={completedOrders} />
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No completed orders found.</p>
          </div>
        ))}
    </div>
  );
};

export default OrderTabs;