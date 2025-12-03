import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ErrorBanner from '../components/ErrorBanner';
// ...existing code...
// ...existing code...

export default function OcrResult() {
  const navigate = useNavigate();
  const { ocrResult, crops, error, reset } = useApp();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  if (!ocrResult) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-surface rounded-xl shadow-2xl p-8 border border-surface/10">
              <div className="text-center">
                <p className="text-charcoal-50 mb-4">No OCR results available</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gradient-to-r from-purple to-indigo text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo/50 hover:scale-105 transition-all duration-200"
                >
                  Start Over
                </button>
              </div>
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
          <h1 className="text-3xl font-bold text-primary mb-2">OCR Results</h1>
          <p className="text-secondary text-lg">Step 4: Review extracted text and information</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Summary Card */}
          <div className="bg-surface rounded-2xl shadow-2xl border border-secondary/20 overflow-hidden">
            <div className="bg-gradient-to-r from-success/5 to-primary/5 px-6 py-4 border-b border-secondary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-primary">Processing Complete</h2>
                    <p className="text-secondary text-sm">All text regions have been analyzed</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/crop')}
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

            <div className="p-6">
              <ErrorBanner error={error} />

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{Object.keys(ocrResult || {}).length - (ocrResult?.BD ? 1 : 0)}</div>
                      <div className="text-secondary text-sm">Text Fields</div>
                    </div>
                  </div>
                </div>
                <div className="bg-success/5 rounded-lg p-4 border border-success/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-success">100%</div>
                      <div className="text-secondary text-sm">Processing Rate</div>
                    </div>
                  </div>
                </div>
                <div className="bg-accent/5 rounded-lg p-4 border border-accent/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">{ocrResult?.BD ? '✓' : '-'}</div>
                      <div className="text-secondary text-sm">Birth Date</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Birth Date Highlight */}
          {ocrResult.BD && (
            <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl p-8 border border-success/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-1">Birth Date Detected</h3>
                    <p className="text-secondary">Automatically extracted from ID number</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-success mb-1" style={{ textAlign: 'right', direction: 'ltr' }}>
                    {Array.isArray(ocrResult.BD) ? ocrResult.BD[0] : ocrResult.BD}
                  </div>
                  <div className="text-secondary text-sm">Egyptian ID Format</div>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cropLabels.map((label) => {
              const cropUrl = crops[label];
              const fullUrl = cropUrl?.startsWith('http')
                ? cropUrl
                : `${API_BASE}${cropUrl?.startsWith('/') ? cropUrl : `/${cropUrl}`}`;
              const texts = ocrResult[label] || [];
              const extractedText = Array.isArray(texts)
                ? (label === 'Num2' ? texts.join(' ') : texts.join(' '))
                : (texts || '');

              return (
                <div key={label} className="bg-surface rounded-2xl shadow-lg border border-secondary/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4 border-b border-secondary/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-primary">{label}</h3>
                      {label === 'Num1' && (
                        <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30 font-medium">
                          Source for BD
                        </span>
                      )}
                      <div className={`w-3 h-3 rounded-full ${extractedText ? 'bg-success' : 'bg-secondary/50'}`}></div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Image Preview */}
                    <div className="mb-4">
                      <div className="aspect-video bg-surface/30 rounded-lg border border-secondary/10 flex items-center justify-center overflow-hidden">
                        {cropUrl ? (
                          <img
                            src={fullUrl}
                            alt={`${label} region`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <svg className="w-8 h-8 text-secondary/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-secondary/50 text-sm">No image</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Extracted Text */}
                    <div className="bg-surface/50 rounded-lg p-4 border border-secondary/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-secondary text-sm font-medium">Extracted Text</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${extractedText ? 'bg-success/20 text-success' : 'bg-secondary/20 text-secondary'}`}>
                          {extractedText ? 'Success' : 'No text'}
                        </span>
                      </div>
                      <div
                        className="text-primary font-mono text-sm break-words min-h-[2rem] flex items-center"
                        style={{
                          textAlign: 'right',
                          direction: 'rtl',
                          fontFamily: label === 'Num2' ? 'monospace' : 'Arial, sans-serif'
                        }}
                      >
                        {extractedText || <span className="text-secondary/50 italic">No text extracted</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Raw Data Section */}
          <div className="bg-surface rounded-2xl shadow-lg border border-secondary/20 overflow-hidden">
            <div className="bg-gradient-to-r from-surface/50 to-surface/30 px-6 py-4 border-b border-secondary/10">
              <h3 className="text-lg font-semibold text-primary">Technical Details</h3>
              <p className="text-secondary text-sm">Raw OCR processing data</p>
            </div>
            <div className="p-6">
              <details className="group">
                <summary className="flex items-center justify-between p-4 bg-surface/30 rounded-lg cursor-pointer hover:bg-surface/50 transition-all duration-200">
                  <span className="font-medium text-primary">View Complete JSON Response</span>
                  <svg className="w-5 h-5 text-secondary group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 p-4 bg-background rounded-lg border border-secondary/20 overflow-x-auto">
                  <pre className="text-success text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(ocrResult, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={() => {
                reset();
                navigate('/');
              }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-accent to-primary text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 space-x-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Start New Process</span>
            </button>
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
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <span className="text-success font-medium">Detect</span>
            </div>
            <div className="w-8 h-px bg-success"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <span className="text-success font-medium">Crop</span>
            </div>
            <div className="w-8 h-px bg-success"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <span className="text-success font-medium">Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

