import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ErrorBanner from '../components/ErrorBanner';

export default function OcrResult() {
  const navigate = useNavigate();
  const { ocrResult, crops, error, reset } = useApp();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  if (!ocrResult) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No OCR results available</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
              >
                Start Over
              </button>
            </div>
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
            <h1 className="text-3xl font-bold text-gray-800">Step 4: OCR Results</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/crop')}
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

          <ErrorBanner error={error} />

          <div className="mb-6">
            <p className="text-gray-600">
              Extracted text from all regions. BD (Birth Date) is automatically derived from Num1.
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {cropLabels.map((label) => {
              const cropUrl = crops[label];
              const fullUrl = cropUrl?.startsWith('http')
                ? cropUrl
                : `${API_BASE}${cropUrl?.startsWith('/') ? cropUrl : `/${cropUrl}`}`;
              
              const texts = ocrResult[label] || [];
              // Join text - for Arabic fields, text is already in correct RTL order from backend
              // For Num2 (English), join normally
              const extractedText = Array.isArray(texts) 
                ? (label === 'Num2' ? texts.join(' ') : texts.join(' '))
                : (texts || '');

              return (
                <div key={label} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
                    {label === 'Num1' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Used for BD
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <div className="aspect-video bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden mb-3">
                      {cropUrl ? (
                        <img
                          src={fullUrl}
                          alt={label}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">No image</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Extracted Text:</div>
                    <div 
                      className="text-sm font-mono text-gray-800 break-words"
                      style={{ 
                        textAlign: 'right',
                        direction: 'rtl',
                        fontFamily: label === 'Num2' ? 'monospace' : 'Arial, sans-serif'
                      }}
                    >
                      {extractedText || <span className="text-gray-400 italic">No text extracted</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BD Section */}
          {ocrResult.BD && (
            <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-800">Birth Date (BD)</h2>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                  Derived from Num1
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Automatically calculated from the first 7 digits of Num1 using Egyptian ID format.
              </p>
              <div className="bg-white rounded p-4 border border-green-200">
                <div 
                  className="text-2xl font-bold text-green-700"
                  style={{ textAlign: 'right', direction: 'ltr' }}
                >
                  {Array.isArray(ocrResult.BD) ? ocrResult.BD[0] : ocrResult.BD}
                </div>
              </div>
            </div>
          )}

          {/* JSON View */}
          <div className="mt-6">
            <details className="border-2 border-gray-200 rounded-lg">
              <summary className="p-4 cursor-pointer font-semibold text-gray-700 hover:bg-gray-50">
                View Raw JSON
              </summary>
              <div className="p-4 bg-gray-900 text-green-400 font-mono text-xs overflow-x-auto">
                <pre>{JSON.stringify(ocrResult, null, 2)}</pre>
              </div>
            </details>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                reset();
                navigate('/');
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

