import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import Loading from '../components/Loading';

export default function Upload() {
  const navigate = useNavigate();
  const { imageFile, setImageFile, setImageUrl, setImagePath, setBoxes, setLoading, setError, reset } = useApp();
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Please select a valid image file');
      return;
    }

    setLocalError(null);
    setImageFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageFile) {
      setLocalError('Please select an image first');
      return;
    }

    setIsUploading(true);
    setLoading(true);
    setError(null);
    setLocalError(null);

    try {
      const result = await apiClient.detect(imageFile);
      setImagePath(result.image_path);
      setImageUrl(result.image_url || `/static/uploads/${result.image_path.split('/').pop()}`);
      setBoxes(result.boxes || {});
      navigate('/detect');
    } catch (err) {
      setError(err.message);
      setLocalError(err.message);
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Upload ID Card</h1>
          <p className="text-secondary text-lg">Step 1: Choose your ID card image to begin processing</p>
        </div>

        {/* Main Card */}
        <div className="bg-surface rounded-2xl shadow-2xl border border-secondary/20 overflow-hidden">
          {/* Card Header with Reset */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-secondary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h2 className="text-xl font-semibold text-primary">Select Image</h2>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8">
            {localError && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-error font-medium">{localError}</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-primary mb-2">Choose ID Card Image</h3>
                  <p className="text-secondary text-sm">Supported formats: JPG, PNG, GIF, WebP</p>
                </div>

                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-primary mb-1">Click to upload or drag and drop</p>
                        <p className="text-secondary text-sm">Maximum file size: 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              {preview && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-primary">Preview</h3>
                    <div className="text-xs text-secondary bg-surface/50 px-2 py-1 rounded">
                      Ready to process
                    </div>
                  </div>
                  <div className="bg-surface/30 rounded-lg p-4 border border-secondary/10">
                    <img
                      src={preview}
                      alt="ID Card Preview"
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                <button
                  onClick={handleUpload}
                  disabled={!imageFile || isUploading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-300 ${
                    isUploading || !imageFile
                      ? 'bg-surface/20 text-secondary/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-accent to-primary text-white hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Upload & Detect</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <span className="text-primary font-medium">Upload</span>
            </div>
            <div className="w-8 h-px bg-secondary/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center text-secondary font-bold border border-secondary/30">
                2
              </div>
              <span className="text-secondary">Detect</span>
            </div>
            <div className="w-8 h-px bg-secondary/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center text-secondary font-bold border border-secondary/30">
                3
              </div>
              <span className="text-secondary">Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
