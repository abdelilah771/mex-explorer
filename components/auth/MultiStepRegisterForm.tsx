// components/auth/MultiStepRegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MultiStepRegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Redirect to the login page on success
        router.push('/login');
      } else {
        const data = await response.json();
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '15px' }}>
        <label>Full Name</label>
        <input type="text" name="name" onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Email</label>
        <input type="email" name="email" onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Password</label>
        <input type="password" name="password" onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
        Register
      </button>
    </form>
  );
}