import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../firebase/firestoreService';

export default function QuizGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    const userId = user.id;

    if (user.role === 'admin' || user.role === 'manager') {
      setQuizCompleted(true);
      setLoading(false);
      return;
    }
    
    if (user.quizCompleted) {
      setQuizCompleted(true);
      setLoading(false);
    } else {
      // Check the legacy API results
      fetch('/api/quiz-results')
        .then(res => res.json())
        .then(async data => {
          const result = data[userId];
          if (result && result.quizCompleted) {
            setQuizCompleted(true);
            // Sync to the main user document so we don't need to ask again
            try {
              await updateUser(userId, { quizCompleted: true });
            } catch (err) {
              console.error("Failed to sync quizCompleted state to DB:", err);
            }
          }
        })
        .catch(err => {
          console.error("Error fetching quiz results:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-gold animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!quizCompleted) {
    return <Navigate to="/assessment" replace />;
  }

  return <>{children}</>;
}
