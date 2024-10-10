// src\app\reset-password\page.tsx
"use client"
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Updated import

export default function ResetPassword() {
  const router = useRouter(); // Correctly using next/navigation for router
  const searchParams = useSearchParams(); // Hook to get query params
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Get query parameters from the URL
    const token = searchParams.get('token');
    const id = searchParams.get('id');

    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,  // Extracted from URL params
          id,     // Extracted from URL params
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successfully!');
        setError('');
        router.push('/login'); // Redirect to login after successful reset
      } else {
        setError(data.message);
      }
    } catch (err) {
        console.log(err);
        
      setError('Failed to reset password');
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
