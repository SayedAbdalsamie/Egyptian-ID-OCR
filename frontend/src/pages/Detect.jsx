import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import Loading from '../components/Loading';
import BoxOverlay from '../components/BoxOverlay';

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
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <Loading message="Cropping selected regions..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Step 2: Detect Boxes</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/')}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image with overlay */}
            <div className="lg:col-span-2">
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="relative inline-block max-w-full">
                  {fullImageUrl && (
                    <>
                      <img
                        ref={imageRef}
                        src={fullImageUrl}
                        alt="ID Card"
                        onLoad={handleImageLoad}
                        className="max-w-full h-auto rounded"
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
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Detected Fields ({selectedBoxes.size}/{Object.keys(boxes).length})
                </h2>
                
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex-1 px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="flex-1 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Deselect All
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Object.keys(boxes).map((label) => {
                    const isSelected = selectedBoxes.has(label);
                    return (
                      <label
                        key={label}
                        className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-green-50 border-2 border-green-500'
                            : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBoxToggle(label)}
                          className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="font-medium text-gray-700">{label}</span>
                      </label>
                    );
                  })}
                </div>

                <button
                  onClick={handleCrop}
                  disabled={selectedBoxes.size === 0}
                  className="w-full mt-4 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Crop Selected ({selectedBoxes.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

