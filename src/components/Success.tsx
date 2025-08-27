import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Success() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    const status = searchParams.get('status');
    const errorMessage = searchParams.get('message');

    if (status === 'success') {
      setMessage('Payment successful!');
      const orderDetailsString = localStorage.getItem('orderDetails');
      if (orderDetailsString) {
        const orderDetails = JSON.parse(orderDetailsString);
        const { cart, firstName, lastName, email, phone, address, city, state, location, totalPrice, session } = orderDetails;

        const totalWithShipping = totalPrice + 5.99;

        const orderData: any = {
          order_number: `ORD-${Date.now()}`,
          total_amount: totalWithShipping.toFixed(2),
          status: 'completed',
          order_date: new Date().toISOString(),
          user_id: session?.user?.id || null,
          items: cart.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        const customerInfo = {
          customer_name: `${firstName} ${lastName}`.trim() || 'Guest',
          shipping_address: {
            phone: phone,
            address: address,
            city: city,
            state: state,
            zipCode: '',
            latitude: location ? parseFloat(location.split(', ')[0]) : null,
            longitude: location ? parseFloat(location.split(', ')[1]) : null,
          }
        };

        const createOrder = async () => {
          if (session?.user) {
            const customerDetailData = {
              user_id: session.user.id,
              ...customerInfo
            };

            const { data: customerDetail, error: customerError } = await supabase
              .from('customer_detail')
              .insert([customerDetailData])
              .select()
              .single();

            if (customerError) {
              console.error('❌ Customer detail insert failed:', customerError);
              setMessage(`Payment successful, but failed to create customer details: ${customerError.message}`);
              return;
            }
            orderData.customer_detail_id = customerDetail.id;
          }

          let { data: insertedOrder, error: orderError } = await supabase
            .from('orders')
            .insert([orderData])
            .select();

          if (orderError) {
            console.error('❌ Order insert failed:', orderError);
            setMessage(`Payment successful, but failed to create order: ${orderError.message}`);
          } else {
            setMessage('Payment successful and order placed!');
            localStorage.removeItem('orderDetails');
            // Optionally clear cart in Supabase if user is logged in
            // if (session?.user) {
            //   await clearUserCart(session.user.id);
            // }
          }
        };
        createOrder();
      } else {
        setMessage('Payment successful, but order details not found in local storage.');
      }
    } else if (status === 'failure') {
      setMessage(`Payment failed: ${errorMessage || 'Unknown error'}`);
    } else {
      setMessage('Invalid payment status.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Payment Status</h1>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
}
