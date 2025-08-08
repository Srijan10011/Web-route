import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"
 
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