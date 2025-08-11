import React, { useState, useEffect } from 'react';
import { Package, Clock, Mail, User } from 'lucide-react';

interface GuestOrderAccessProps {
  setCurrentPage: (page: string) => void;
}

interface GuestSession {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  expiresAt: number;
  orderData: any;
}

export default function GuestOrderAccess({ setCurrentPage }: GuestOrderAccessProps) {
  const [guestSessions, setGuestSessions] = useState<GuestSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GuestSession | null>(null);

  useEffect(() => {
    // Load all guest sessions
    const sessions = JSON.parse(localStorage.getItem('guestSessions') || '[]');
    const validSessions = sessions.filter((session: GuestSession) => 
      session.expiresAt > Date.now()
    );
    
    // Remove expired sessions
    if (validSessions.length !== sessions.length) {
      localStorage.setItem('guestSessions', JSON.stringify(validSessions));
    }
    
    setGuestSessions(validSessions);
    
    if (validSessions.length > 0) {
      setCurrentSession(validSessions[0]); // Show first session by default
    }
  }, []);

  const clearSession = (sessionId: string) => {
    const updatedSessions = guestSessions.filter(session => session.orderId !== sessionId);
    setGuestSessions(updatedSessions);
    localStorage.setItem('guestSessions', JSON.stringify(updatedSessions));
    
    if (updatedSessions.length === 0) {
      setCurrentSession(null);
    } else {
      setCurrentSession(updatedSessions[0]);
    }
  };

  const clearAllSessions = () => {
    setGuestSessions([]);
    setCurrentSession(null);
    localStorage.removeItem('guestSessions');
  };

  if (guestSessions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">No Guest Orders</h1>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders as a guest user yet.
            </p>
            <button
              onClick={() => setCurrentPage('shop')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Place New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Clock className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Session Expired</h1>
            <p className="text-gray-600 mb-6">
              Your guest sessions have expired. Guest sessions are valid for 24 hours after placing an order.
            </p>
            <button
              onClick={() => setCurrentPage('shop')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Place New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timeRemaining = Math.max(0, currentSession.expiresAt - Date.now());
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Guest Order Access</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Session expires in</p>
              <p className="text-lg font-semibold text-orange-600">
                {hoursRemaining}h {minutesRemaining}m
              </p>
            </div>
          </div>

          {/* Order Selection */}
          {guestSessions.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Order to View:
              </label>
              <select
                value={currentSession.orderId}
                onChange={(e) => {
                  const selected = guestSessions.find(s => s.orderId === e.target.value);
                  if (selected) setCurrentSession(selected);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2"
              >
                {guestSessions.map((session) => (
                  <option key={session.orderId} value={session.orderId}>
                    Order #{session.orderNumber} - {session.customerName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Package className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-800">Order Details</span>
              </div>
              <p className="text-gray-600">Order #{currentSession.orderNumber}</p>
              <p className="text-gray-600">Status: Pending</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-800">Customer Info</span>
              </div>
              <p className="text-gray-600">{currentSession.customerName}</p>
              <p className="text-gray-600">{currentSession.customerEmail}</p>
            </div>
          </div>

          {/* All Orders List */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Your Orders</h3>
            <div className="space-y-4">
              {guestSessions.map((session) => (
                <div key={session.orderId} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">Order #{session.orderNumber}</h4>
                      <p className="text-sm text-gray-600">{session.customerName}</p>
                      <p className="text-sm text-gray-600">Total: ${typeof session.orderData.total_amount === 'number' ? session.orderData.total_amount.toFixed(2) : session.orderData.total_amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Expires: {new Date(session.expiresAt).toLocaleString()}
                      </p>
                      <button
                        onClick={() => clearSession(session.orderId)}
                        className="text-red-500 hover:text-red-700 text-sm mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="space-y-2">
                    {(typeof session.orderData.items === 'string' 
                      ? JSON.parse(session.orderData.items) 
                      : session.orderData.items
                    ).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.name} x {item.quantity}</span>
                        <span className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={clearAllSessions}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Clear All Sessions
            </button>
            <button
              onClick={() => setCurrentPage('shop')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
