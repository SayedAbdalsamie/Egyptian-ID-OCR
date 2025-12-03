import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import Loading from '../components/Loading';
import BoxOverlay from '../components/BoxOverlay';
// ...existing code...
// ...existing code...

export default function Detect() {
  const navigate = useNavigate();
  const {
    imageUrl,
    imagePath,
    boxes,
    selectedBoxes,
    setSelectedBoxes,
    setCropMap,
    setCrops,
    loading,
    setLoading,
    setError,
    reset,
  } = useApp();
  
  const [imageSize, setImageSize] = useState(null);
  const [localError, setLocalError] = useState(null);
  const imageRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!imagePath || !boxes || Object.keys(boxes).length === 0) {
      navigate('/');
      return;
    }
    // Select all boxes by default when component mounts
    if (selectedBoxes.size === 0 && Object.keys(boxes).length > 0) {
      setSelectedBoxes(new Set(Object.keys(boxes)));
    }
  }, [imagePath, boxes, navigate, selectedBoxes, setSelectedBoxes]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  };

  const handleBoxToggle = (label) => {
    const newSelected = new Set(selectedBoxes);
    if (newSelected.has(label)) {
      newSelected.delete(label);
    } else {
      newSelected.add(label);
    }
    setSelectedBoxes(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedBoxes(new Set(Object.keys(boxes)));
  };

  const handleDeselectAll = () => {
    setSelectedBoxes(new Set());
  };

  const handleCrop = async () => {
    if (selectedBoxes.size === 0) {
      setLocalError('Please select at least one box to crop');
      return;
    }

    if (!imagePath) {
      setLocalError('Image path not found');
      return;
    }

    setLoading(true);
    setError(null);
    setLocalError(null);

    try {
      // Filter boxes to only include selected ones
      const filteredBoxes = {};
      selectedBoxes.forEach(label => {
        if (boxes[label]) {
          filteredBoxes[label] = boxes[label];
        }
      });

      const result = await apiClient.crop(imagePath, filteredBoxes);
      
      setCropMap(result.crop_map);
      setCrops(result.crops);
      
      navigate('/crop');
    } catch (err) {
      setError(err.message);
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fullImageUrl = imageUrl?.startsWith('http') 
    ? imageUrl 
    : `${API_BASE}${imageUrl?.startsWith('/') ? imageUrl : `/${imageUrl}`}`;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-surface rounded-xl shadow-2xl p-8 border border-surface/10">
              <Loading message="Cropping selected regions..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Region Detection</h1>
          <p className="text-secondary text-lg">Step 2: Review and select text regions for processing</p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Image Section - Takes up 2/3 on large screens */}
          <div className="xl:col-span-2">
            <div className="bg-surface rounded-2xl shadow-2xl border border-secondary/20 overflow-hidden">
              {/* Image Header */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-secondary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-primary">ID Card Analysis</h2>
                      <p className="text-secondary text-sm">AI-detected regions highlighted</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{Object.keys(boxes).length}</div>
                    <div className="text-xs text-secondary">regions found</div>
                  </div>
                </div>
              </div>

              {/* Image Display */}
              <div className="p-6">
                <ErrorBanner error={localError} onDismiss={() => setLocalError(null)} />

                <div className="bg-surface/30 rounded-xl p-6 border-2 border-dashed border-primary/20 hover:border-primary/30 transition-all duration-300">
                  <div className="relative inline-block max-w-full">
                    {fullImageUrl ? (
                      <>
                        <img
                          ref={imageRef}
                          src={fullImageUrl}
                          alt="ID Card with detected regions"
                          onLoad={handleImageLoad}
                          className="max-w-full h-auto rounded-lg shadow-lg"
                        />
                        {imageSize && (
                          <BoxOverlay
                            imageRef={imageRef}
                            boxes={boxes}
                            selectedBoxes={selectedBoxes}
                            onBoxToggle={handleBoxToggle}
                            imageSize={imageSize}
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-secondary/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-secondary">No image to analyze</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Sidebar - Takes up 1/3 on large screens */}
          <div className="xl:col-span-1">
            <div className="bg-surface rounded-2xl shadow-2xl border border-secondary/20 overflow-hidden sticky top-8">
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-accent/5 to-primary/5 px-6 py-4 border-b border-secondary/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">Region Selection</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{selectedBoxes.size}</span>
                    </div>
                    <span className="text-secondary text-sm">selected</span>
                  </div>
                </div>
              </div>

              {/* Controls Content */}
              <div className="p-6">
                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full px-4 py-3 text-sm font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Upload</span>
                  </button>
                  <button
                    onClick={reset}
                    className="w-full px-4 py-3 text-sm font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Reset Selection</span>
                  </button>
                </div>

                {/* Bulk Actions */}
                <div className="bg-surface/30 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-primary mb-3 text-sm">Bulk Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-2 text-xs font-medium bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all duration-200 border border-primary/30"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="px-3 py-2 text-xs font-medium bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-all duration-200 border border-secondary/20"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Region List */}
                <div className="space-y-3">
                  <h4 className="font-medium text-primary text-sm">Detected Regions</h4>
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {Object.keys(boxes).map((label) => {
                      const isSelected = selectedBoxes.has(label);
                      return (
                        <label
                          key={label}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                            isSelected
                              ? 'bg-success/20 border-success shadow-lg shadow-success/20'
                              : 'bg-surface/50 border-surface/20 hover:border-primary/50 hover:bg-surface/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleBoxToggle(label)}
                            className="mr-3 h-4 w-4 text-primary focus:ring-primary border-secondary/30 rounded bg-surface cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className={`font-medium ${isSelected ? 'text-success' : 'text-secondary'}`}>
                              {label}
                            </span>
                            {isSelected && (
                              <div className="text-xs text-success/70 mt-1">Selected for processing</div>
                            )}
                          </div>
                          {isSelected && (
                            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Process Button */}
                <div className="mt-6 pt-4 border-t border-secondary/10">
                  <button
                    onClick={handleCrop}
                    disabled={selectedBoxes.size === 0}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-300 ${
                      selectedBoxes.size === 0
                        ? 'bg-surface/20 text-secondary/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-accent to-primary text-white hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-4 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Process Regions</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {selectedBoxes.size > 0 && (
                    <p className="text-center text-secondary text-sm mt-2">
                      Ready to crop {selectedBoxes.size} region{selectedBoxes.size !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <span className="text-success font-medium">Upload</span>
            </div>
            <div className="w-8 h-px bg-success"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <span className="text-primary font-medium">Detect</span>
            </div>
            <div className="w-8 h-px bg-secondary/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center text-secondary font-bold border border-secondary/30">
                3
              </div>
              <span className="text-secondary">Crop</span>
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
