import { useState, useEffect } from 'react';

/**
 * Custom hook for data fetching with pagination
 */
export const useFetch = (fetchFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchFunction(params);
      
      if (response.success) {
        // Handle both array and object responses
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else if (response.data) {
          // Check for common data property names
          const dataArray = response.data.employees 
            || response.data.attendance 
            || response.data.leaves 
            || response.data.payrolls 
            || response.data.payruns 
            || response.data.items
            || [];
          
          setData(dataArray);
          
          // Set pagination if available
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  const refetch = () => {
    fetchData();
  };

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return {
    data,
    pagination,
    loading,
    error,
    refetch,
    updateParams,
  };
};

export default useFetch;
