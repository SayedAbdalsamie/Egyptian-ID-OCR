import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Upload from './pages/Upload';
import Detect from './pages/Detect';
import Crop from './pages/Crop';
import OcrResult from './pages/OcrResult';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/detect" element={<Detect />} />
          <Route path="/crop" element={<Crop />} />
          <Route path="/result" element={<OcrResult />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
