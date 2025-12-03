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
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>Step 1: Upload ID Card</h1>
            <button
              onClick={handleReset}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '0.25rem', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              Reset
            </button>
          </div>

          {localError && (
            <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '1rem', marginBottom: '1rem', borderRadius: '0.25rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{localError}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Select ID Card Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'block', width: '100%', fontSize: '0.875rem', color: '#6b7280' }}
              />
            </div>

            {preview && (
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Preview
                </label>
                <div style={{ border: '2px dashed #d1d5db', borderRadius: '0.5rem', padding: '1rem' }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ maxWidth: '100%', height: 'auto', margin: '0 auto', display: 'block', borderRadius: '0.25rem' }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleUpload}
                disabled={!imageFile || isUploading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isUploading || !imageFile ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: isUploading || !imageFile ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isUploading ? 'Processing...' : 'Upload & Detect →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
