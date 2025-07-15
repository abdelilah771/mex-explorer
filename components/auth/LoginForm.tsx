// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // This is the core of the login logic
      const result = await signIn('credentials', {
        redirect: false, // <-- This is important to handle errors here
        email,
        password,
      });

      if (result?.ok) {
        // On success, redirect to the dashboard
        router.push('/dashboard');
        router.refresh(); // Refresh the page to update session state
      } else {
        // On failure, set an error message
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during login.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '15px' }}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
        Login
      </button>
    </form>
  );
}