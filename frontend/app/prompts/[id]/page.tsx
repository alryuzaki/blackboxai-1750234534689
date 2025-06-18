'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Prompt {
  id: number;
  title: string;
  description: string;
  content: string;
  price: number;
  category: string;
  author_name: string;
  user_id: number;
}

export default function PromptDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPrompt();
  }, [params.id]);

  const fetchPrompt = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/prompts/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prompt');
      }
      const data = await response.json();
      setPrompt(data);

      // Check if current user is the owner
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsOwner(user.id === data.user_id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`http://localhost:5000/api/prompts/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      router.push('/prompts');
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading prompt...</div>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            {error || 'Prompt not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{prompt.title}</h1>
                <p className="mt-2 text-sm text-gray-500">
                  Category: {prompt.category}
                </p>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${prompt.price.toFixed(2)}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{prompt.description}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900">Prompt Content</h2>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-gray-600">{prompt.content}</pre>
              </div>
            </div>

            <div className="mt-6 flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">
                    {prompt.author_name[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {prompt.author_name}
                </p>
              </div>
            </div>

            {isOwner && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => router.push(`/prompts/${prompt.id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Edit Prompt
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    deleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {deleting ? 'Deleting...' : 'Delete Prompt'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
