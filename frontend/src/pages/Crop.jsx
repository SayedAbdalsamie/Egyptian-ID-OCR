import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import Loading from '../components/Loading';
// ...existing code...
// ...existing code...

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
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-surface rounded-xl shadow-2xl p-8 border border-surface/10">
              <Loading message="Running OCR on cropped regions..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cropLabels = ['Add1', 'Add2', 'Name1', 'Name2', 'Num1', 'Num2'];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Cropped Regions</h1>
          <p className="text-secondary text-lg">Step 3: Review and process selected regions</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-surface rounded-2xl shadow-2xl border border-secondary/20 overflow-hidden mb-8">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-success/5 to-primary/5 px-6 py-4 border-b border-secondary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary">Region Selection</h2>
                  <p className="text-secondary text-sm">Review the automatically detected regions</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/detect')}
                  className="px-4 py-2 text-sm font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8">
            <ErrorBanner error={localError} onDismiss={() => setLocalError(null)} />

            {/* Instructions */}
            <div className="bg-primary/5 rounded-lg p-4 mb-8 border border-primary/10">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-primary mb-1">Review Instructions</h3>
                  <p className="text-secondary text-sm">
                    The system has automatically detected and cropped text regions from your ID card.
                    Review each region below and click "Run OCR" to extract the text content.
                  </p>
                </div>
              </div>
            </div>

            {/* Regions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {cropLabels.map((label) => {
                const cropUrl = crops[label];
                const fullUrl = cropUrl?.startsWith('http')
                  ? cropUrl
                  : `${API_BASE}${cropUrl?.startsWith('/') ? cropUrl : `/${cropUrl}`}`;

                return (
                  <div key={label} className="group">
                    <div className="bg-surface/50 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg">
                      <div className="p-4 border-b border-secondary/10 bg-gradient-to-r from-primary/5 to-accent/5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-primary text-sm">{label}</h4>
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="aspect-video bg-surface rounded-lg border border-secondary/10 flex items-center justify-center overflow-hidden mb-3">
                          {cropUrl ? (
                            <img
                              src={fullUrl}
                              alt={`${label} region`}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="text-center">
                              <svg className="w-8 h-8 text-secondary/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-secondary/50 text-xs">No image</p>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-secondary text-center">
                          Region ready for OCR processing
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Section */}
            <div className="bg-gradient-to-r from-surface/50 to-surface/30 rounded-xl p-6 border border-secondary/10">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary mb-2">Ready to Extract Text</h3>
                <p className="text-secondary text-sm mb-6">
                  Process all {Object.keys(cropMap || {}).length} detected regions to extract text content
                </p>
                <button
                  onClick={handleOCR}
                  disabled={Object.keys(cropMap || {}).length === 0}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 mx-auto transition-all duration-300 ${
                    Object.keys(cropMap || {}).length === 0
                      ? 'bg-surface/20 text-secondary/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-accent to-primary text-white hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Run OCR Processing</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <span className="text-success font-medium">Upload</span>
            </div>
            <div className="w-8 h-px bg-success"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <span className="text-success font-medium">Detect</span>
            </div>
            <div className="w-8 h-px bg-primary"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <span className="text-primary font-medium">Crop</span>
            </div>
            <div className="w-8 h-px bg-secondary/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center text-secondary font-bold border border-secondary/30">
                4
              </div>
              <span className="text-secondary">Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
