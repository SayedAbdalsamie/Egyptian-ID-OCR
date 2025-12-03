import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [boxes, setBoxes] = useState({});
  const [selectedBoxes, setSelectedBoxes] = useState(new Set());
  const [cropMap, setCropMap] = useState({});
  const [crops, setCrops] = useState({});
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setImageFile(null);
    setImageUrl(null);
    setImagePath(null);
    setBoxes({});
    setSelectedBoxes(new Set());
    setCropMap({});
    setCrops({});
    setOcrResult(null);
    setLoading(false);
    setError(null);
  }, []);

  const value = {
    // State
    imageFile,
    imageUrl,
    imagePath,
    boxes,
    selectedBoxes,
    cropMap,
    crops,
    ocrResult,
    loading,
    error,
    // Setters
    setImageFile,
    setImageUrl,
    setImagePath,
    setBoxes,
    setSelectedBoxes,
    setCropMap,
    setCrops,
    setOcrResult,
    setLoading,
    setError,
    // Actions
    reset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

