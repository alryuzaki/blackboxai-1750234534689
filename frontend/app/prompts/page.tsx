'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Prompt {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  author_name: string;
}

export default function Prompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPrompts(search, page);
  }, [search, page]);

  const fetchPrompts = async (searchQuery: string, pageNumber: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNumber.toString());
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      const response = await fetch(`http://localhost:5000/api/prompts?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }
      const data = await response.json();
      setPrompts(data.prompts);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading prompts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Available Prompts
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse our collection of high-quality AI prompts
          </p>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={handleSearchChange}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white"
            >
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">
                    {prompt.category}
                  </p>
                  <Link href={`/prompts/${prompt.id}`} className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900">{prompt.title}</p>
                    <p className="mt-3 text-base text-gray-500">{prompt.description}</p>
                  </Link>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">{prompt.author_name}</span>
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
                    <div className="flex space-x-1 text-sm text-gray-500">
                      <span>${prompt.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {prompts.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">No prompts available yet.</p>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
              page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
              page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
