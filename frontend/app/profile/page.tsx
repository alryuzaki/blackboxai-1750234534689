'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Prompt {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
}

export default function Profile() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchUserPrompts(token);
  }, [router]);

  const fetchUserPrompts = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/prompts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch your prompts');
      }
      const data = await response.json();
      setPrompts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/prompts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      setPrompts(prompts.filter(prompt => prompt.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading your prompts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Your Prompts</h2>
        {prompts.length === 0 ? (
          <p className="text-gray-500">You have not created any prompts yet.</p>
        ) : (
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <Link href={`/prompts/${prompt.id}`} className="text-lg font-semibold text-gray-900 hover:underline">
                    {prompt.title}
                  </Link>
                  <p className="text-gray-500">{prompt.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/prompts/${prompt.id}/edit`}
                    className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
