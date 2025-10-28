import { useState, useEffect } from 'react';

interface UserEmailData {
  email: string | null;
  userId: string;
}

export function useUserEmail(userId: string | null) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserEmail(null);
      return;
    }

    const fetchUserEmail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/get-user-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (response.ok) {
          setUserEmail(data.email);
        } else {
          setError(data.error || 'Error obteniendo email del usuario');
          setUserEmail(null);
        }
      } catch (err) {
        setError('Error de conexión');
        setUserEmail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEmail();
  }, [userId]);

  return { userEmail, loading, error };
}

