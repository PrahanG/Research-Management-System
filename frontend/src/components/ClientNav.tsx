'use client';
import { useEffect, useState } from 'react';
import { getToken, clearToken, fetchWithAuth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ClientNav() {
  const [isLogged, setIsLogged] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
        setIsLogged(true);
        // We can optionally fetch /auth/me to get the user ID for "My Profile"
        fetchWithAuth('/auth/me')
           .then(data => setUserId(data.id))
           .catch(() => { clearToken(); setIsLogged(false); });
    }
  }, []);

  const handleLogout = () => {
      clearToken();
      window.location.href = '/login';
  };

  return (
    <nav className="flex items-center gap-4">
      <Button variant="link" asChild><a href="/">Dashboard</a></Button>
      <Button variant="link" asChild><a href="/projects">Projects & Teams</a></Button>
      <Button variant="link" asChild><a href="/publications">Publications</a></Button>
      
      {isLogged ? (
          <>
            {userId && <Button variant="outline" asChild><a href={`/users/${userId}`}>My Profile</a></Button>}
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </>
      ) : (
          <Button variant="default" asChild><a href="/login">Login</a></Button>
      )}
      <ThemeToggle />
    </nav>
  );
}
