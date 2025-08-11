import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabaseClient';

export const useTotalCustomersQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['totalCustomers'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('customer_list')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(error.message);
      }
      return count;
    },
    enabled,
  });
};
