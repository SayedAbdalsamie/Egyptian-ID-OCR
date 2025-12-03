import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import Loading from '../components/Loading';

export default function Crop() {
  const navigate = useNavigate();
  const {
    crops,
    cropMap,
    loading,
    setOcrResult,
    setLoading,
    setError,
    reset,
  } = useApp();
  
  const [localError, setLocalError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleOCR = async () => {
    if (!cropMap || Object.keys(cropMap).length === 0) {
      setLocalError('No cropped images available');
      return;
    }

    setLoading(true);
    setError(null);
    setLocalError(null);

    try {
      const result = await apiClient.ocr(cropMap);
      setOcrResult(result.result);
      navigate('/result');
    } catch (err) {
      setError(err.message);
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <Loading message="Running OCR on cropped regions..." />
          </div>
        </div>
      </div>
    );
  }

  const cropLabels = ['Add1', 'Add2', 'Name1', 'Name2', 'Num1', 'Num2'];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Step 3: Cropped Regions</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/detect')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Reset
              </button>
            </div>
          </div>

          <ErrorBanner error={localError} onDismiss={() => setLocalError(null)} />

          <div className="mb-6">
            <p className="text-gray-600">
              Review the cropped regions below. Click "Run OCR" to extract text from each region.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {cropLabels.map((label) => {
              const cropUrl = crops[label];
              const fullUrl = cropUrl?.startsWith('http')
                ? cropUrl
                : `${API_BASE}${cropUrl?.startsWith('/') ? cropUrl : `/${cropUrl}`}`;

              return (
                <div key={label} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-sm font-semibold text-gray-700 mb-2">{label}</div>
                  <div className="aspect-video bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                    {cropUrl ? (
                      <img
                        src={fullUrl}
                        alt={label}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="hidden text-gray-400 text-xs">No image</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleOCR}
              disabled={Object.keys(cropMap || {}).length === 0}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Run OCR
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

