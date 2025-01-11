'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface AnalyzeImageResponse {
  description?: string;
  error?: string;
}

export default function ImageUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError('');
    setDescription('');
    setLoading(true);
    setImage(file);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const data: AnalyzeImageResponse = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to analyze image');
      if (data.description) {
        setDescription(data.description);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          id="image-input"
        />
        <label 
          htmlFor="image-input" 
          className="cursor-pointer block text-center"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <span className="mt-2 block text-sm text-gray-500">
            Click to upload an image
          </span>
        </label>
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 w-full object-contain"
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4 text-gray-600">
          <div className="animate-pulse">Analyzing image...</div>
        </div>
      )}

      {/* Description Display */}
      {description && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-2">Description:</h3>
          <p className="text-gray-700">{description}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}