'use client';
import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface BathroomAnalysis {
  analysis: string;
  message: string;
  error?: string;
}

export default function ImageUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset states
    setError('');
    setAnalysis('');
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
      
      if (!res.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const data: BathroomAnalysis = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAnalysis(data.analysis);
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="grid md:grid-cols-2 gap-2 max-w-10xl">
        {/* Left Column: Image Upload and Preview */}
        <div className="space-y-6 max-w-7xl">
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
                Upload a photo of your busted up, dirty ass bathroom
              </span>
            </label>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <img
                src={preview}
                alt="Bathroom Preview"
                className="w-full object-contain max-h-96"
              />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4 text-gray-600">
              <div className="animate-pulse">Analyzing your bathroom...</div>
            </div>
          )}
        </div>

        {/* Right Column: Analysis */}
        <div className="space-y-4 max-w-7xl">
          {/* Analysis Display */}
          {analysis && (
            <div className="bg-blue-50 p-4 rounded-lg border border-gray-200 max-w-7xl">
              <h3 className="font-medium mb-2 text-lg max-w-7xl">Bathroom Analysis:</h3>
              <div 
                dangerouslySetInnerHTML={{ __html: analysis }} 
                className="analysis-container prose prose-sm"
              />
            </div>
          )}

          {/* Additional Message */}
          {message && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-700">
              {message}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}