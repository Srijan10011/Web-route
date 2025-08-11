import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React, { useState, useEffect } from "react"
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabaseClient';

// Type definitions for admin orders
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  id: number;
  order_number: string;
  total_amount: string;
  status: string;
  order_date: string;
  customer_name: string;
  shipping_address: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
  };
  order_items?: OrderItem[];
  _note?: string;
}
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Custom hook for data fetching with retry logic
export const useDataFetching = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  retryCount: number = 3
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    let lastError: any;
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const result = await fetchFunction();
        setData(result);
        return;
      } catch (err: any) {
        lastError = err;
        console.warn(`Data fetch failed (attempt ${attempt}/${retryCount}):`, err);
        
        if (attempt < retryCount) {
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }
    
    setError(lastError?.message || 'Failed to fetch data');
  }, [fetchFunction, retryCount]);

  React.useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Custom hook for handling data refetching when tab becomes visible
export const useVisibilityRefetch = (
  refetchFn: () => void,
  shouldRefetch: boolean = true,
  dependencies: any[] = []
) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = isVisible;
      const isNowVisible = !document.hidden;
      setIsVisible(isNowVisible);

      // If tab just became visible and we should refetch, do it
      if (!wasVisible && isNowVisible && shouldRefetch) {
        console.log('Tab became visible, re-fetching data...');
        refetchFn();
      }
    };

    const handleFocus = () => {
      if (shouldRefetch) {
        console.log('Window focused, re-fetching data...');
        refetchFn();
      }
    };

    const handleOnline = () => {
      if (shouldRefetch) {
        console.log('Network came online, re-fetching data...');
        refetchFn();
      }
    };

    // Set initial visibility state
    setIsVisible(!document.hidden);

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [refetchFn, shouldRefetch, isVisible, ...dependencies]);

  return { isVisible };
};

// React Query hook for products with automatic refetching
export const useProductsQuery = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Enhanced refetch behavior for visibility changes
    refetchInterval: (query) => {
      // If we have no data and the query is stale, refetch every 30 seconds
      if (!query.state.data || query.state.data.length === 0) {
        return 30000;
      }
      return false; // Don't refetch if we have data
    },
  });
};

// React Query hook for a single product
export const useProductQuery = (productId: number | null) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('No product ID provided');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
  });
};

// React Query hook for user profile
export const useProfileQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID provided');
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, role')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
  });
};

// React Query hook for user orders
export const useUserOrdersQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userOrders', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID provided');
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, order_date, items')
        .eq('user_id', userId)
        .order('order_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
  });
};

// React Query hook for user addresses
export const useUserAddressesQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userAddresses', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID provided');
      const { data, error } = await supabase
        .from('user_addresses')
        .select('phone, address, city, state, zip_code, latitude, longitude')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
  });
};

// React Query hook for admin orders
export const useAdminOrdersQuery = (enabled: boolean = true) => {
  return useQuery<AdminOrder[]>({
    queryKey: ['adminOrders'],
    queryFn: async (): Promise<AdminOrder[]> => {
      console.log('Fetching admin orders...');
      try {
        // First, check if we can connect to the database
        const { data: connectionTest, error: connectionError } = await supabase
          .from('orders')
          .select('count')
          .limit(1);
        
        if (connectionError) {
          console.error('Database connection error:', connectionError);
          throw new Error(`Database connection failed: ${connectionError.message}`);
        }

        // Get all orders with all available fields
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('order_date', { ascending: false });
        
        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          throw ordersError;
        }

        console.log('Orders fetched successfully:', orders);

        // Since order_items table doesn't exist, we'll work with the orders table directly
        // Check if orders have an 'items' field or similar that might contain order details
        const ordersWithItems: AdminOrder[] = (orders || []).map(order => {
          // Check if the order has an 'items' field (common in some database designs)
          const hasItemsField = order.hasOwnProperty('items');
          const hasOrderItemsField = order.hasOwnProperty('order_items');
          
          let orderItems: OrderItem[] = [];
          let note = '';
          
          if (hasItemsField && order.items) {
            // If there's an 'items' field, try to parse it
            try {
              if (typeof order.items === 'string') {
                orderItems = JSON.parse(order.items);
              } else if (Array.isArray(order.items)) {
                orderItems = order.items;
              }
              note = 'Items loaded from orders.items field';
            } catch (parseError) {
              note = 'Could not parse items from orders.items field';
            }
          } else if (hasOrderItemsField && order.order_items) {
            // If there's an 'order_items' field, try to parse it
            try {
              if (typeof order.order_items === 'string') {
                orderItems = JSON.parse(order.order_items);
              } else if (Array.isArray(order.order_items)) {
                orderItems = order.order_items;
              }
              note = 'Items loaded from orders.order_items field';
            } catch (parseError) {
              note = 'Could not parse items from orders.order_items field';
            }
          } else {
            // No items field found
            note = 'No items field found in orders table. Consider adding an items JSONB field or creating an order_items table.';
          }

          return {
            id: order.id,
            order_number: order.order_number || `ORDER-${order.id}`,
            total_amount: order.total_amount || '0.00',
            status: order.status || 'pending',
            order_date: order.order_date || new Date().toISOString(),
            customer_name: order.customer_name || order.customer_name || 'Unknown Customer',
            shipping_address: order.shipping_address || {},
            order_items: orderItems,
            _note: note
          };
        });

        console.log('Final orders with items:', ordersWithItems);
        return ordersWithItems;
      } catch (err: any) {
        console.error('Exception in admin orders query:', err);
        throw err;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
  });
};

// React Query hook for admin products
export const useAdminProductsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
  });
};

// React Query hook for categories
export const useCategoriesQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
  });
};

// React Query hook for order tracking
export const useOrderTrackingQuery = (orderNumber: string | null) => {
  return useQuery({
    queryKey: ['orderTracking', orderNumber],
    queryFn: async () => {
      if (!orderNumber) throw new Error('No order number provided');
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('order_number', orderNumber)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderNumber,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
  });
};