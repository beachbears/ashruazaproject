import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../capstone/axiosConfig';

export const FeedbackDataContext = createContext({
  feedbackData: [],
  loading: true,
  error: null,
  refetch: () => {},
});

export const FeedbackDataProvider = ({ children }) => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/feedbacks');
      setFeedbackData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching feedback');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const refetch = () => {
    fetchFeedback();
  };

  return (
    <FeedbackDataContext.Provider value={{ feedbackData, loading, error, refetch }}>
      {children}
    </FeedbackDataContext.Provider>
  );
};
