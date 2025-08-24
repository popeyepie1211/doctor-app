import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [loading, setLoading] = useState(false);  // loading state
  const [error, setError] = useState(null);   
  const [data, setData] = useState(null);

  const fn = async (...args) => {
    setLoading(true);    // Set loading state to true
    setError(null);
    try {
      const response = await cb(...args); // cb is like setUserRole
      setData(response);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      setError(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, fn, setData }; 
};

export default useFetch;

