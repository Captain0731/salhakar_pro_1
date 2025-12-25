import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCw } from 'lucide-react';

// Set up PDF.js worker - use local worker file that matches react-pdf version
if (typeof window !== 'undefined') {
  // Use local worker file from public folder (copied from react-pdf's node_modules)
  // This ensures version 5.4.296 matches the API version
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  
  console.log('PDF.js worker configured:', pdfjs.GlobalWorkerOptions.workerSrc);
  console.log('PDF.js API version:', pdfjs.version);
  console.log('Expected worker version: 5.4.296 (from react-pdf)');
}

/**
 * React PDF Viewer Component
 * A complete PDF viewer using react-pdf library
 * 
 * Features:
 * - Page navigation
 * - Zoom in/out
 * - Download PDF
 * - Rotate pages
 * - Responsive design
 */
export default function ReactPDFViewer({ pdfUrl, title = "PDF Document" }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllPages, setShowAllPages] = useState(true);
  const [workerReady, setWorkerReady] = useState(false);

  // Ensure worker is ready before loading PDF
  useEffect(() => {
    // Wait for the worker to actually initialize
    // PDF.js worker needs time to load and initialize
    const initWorker = async () => {
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        console.error('Worker not configured!');
        setError('PDF.js worker not configured. Please refresh the page.');
        return;
      }
      
      // Verify worker file exists first
      try {
        const response = await fetch(pdfjs.GlobalWorkerOptions.workerSrc.split('?')[0], { method: 'HEAD' });
        console.log('Worker file check:', response.status, pdfjs.GlobalWorkerOptions.workerSrc);
      } catch (err) {
        console.warn('Worker file check failed:', err);
      }
      
      // Give the worker more time to actually initialize (2 seconds to be safe)
      // The worker needs to be fully loaded before any PDF operations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWorkerReady(true);
      console.log('Worker initialized and ready:', pdfjs.GlobalWorkerOptions.workerSrc);
    };
    
    initWorker();
  }, []);

  // Debug: Log when pdfUrl changes
  useEffect(() => {
    console.log('ReactPDFViewer - pdfUrl changed:', pdfUrl);
    if (pdfUrl && workerReady) {
      setLoading(true);
      setError(null);
      setNumPages(null);
      setPageNumber(1);
      
      // Test if the URL is accessible
      fetch(pdfUrl, { method: 'HEAD' })
        .then(response => {
          console.log('PDF URL accessibility check:', {
            url: pdfUrl,
            status: response.status,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          });
        })
        .catch(err => {
          console.error('PDF URL accessibility check failed:', err);
        });
    }
  }, [pdfUrl, workerReady]);

  function onDocumentLoadSuccess({ numPages }) {
    console.log('PDF loaded successfully, pages:', numPages);
    // Wait a bit more to ensure worker is fully ready before rendering pages
    setTimeout(() => {
      setNumPages(numPages);
      setLoading(false);
      setError(null);
    }, 500);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    
    let errorMessage = 'Failed to load PDF document';
    
    if (error?.message) {
      errorMessage += `: ${error.message}`;
    }
    
    // Check for common errors
    if (error?.message?.includes('worker') || error?.name === 'WorkerError' || error?.message?.includes('sendWithPromise')) {
      errorMessage = 'PDF.js worker failed to initialize. Please refresh the page. If the problem persists, the worker file may be missing or incompatible.';
      // Try to reload the worker
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      errorMessage = 'PDF file not found. Please check the file path.';
    } else if (error?.message?.includes('CORS')) {
      errorMessage = 'CORS error: PDF cannot be loaded due to security restrictions.';
    } else if (error?.message?.includes('Invalid PDF')) {
      errorMessage = 'Invalid PDF file. The file may be corrupted.';
    }
    
    setError(errorMessage);
    setLoading(false);
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.25));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.25));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {!showAllPages && (
            <>
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm font-medium px-3">
                Page {pageNumber} of {numPages || '--'}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          {showAllPages && numPages && (
            <span className="text-sm font-medium px-3">
              Showing all {numPages} pages
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllPages(!showAllPages)}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title={showAllPages ? "Switch to single page view" : "Show all pages"}
          >
            {showAllPages ? "Single Page" : "All Pages"}
          </button>
          
          <button
            onClick={zoomOut}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium px-2 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          <button
            onClick={rotate}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-2"
            title="Rotate"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-2"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-100">
        {error && (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
              <p className="text-red-600 mb-4 font-semibold">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {!error && !workerReady ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing PDF worker...</p>
            </div>
          </div>
        ) : !error && pdfUrl && workerReady ? (
          <div className="w-full">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF document...</p>
                    <p className="text-xs text-gray-400 mt-2">URL: {pdfUrl}</p>
                  </div>
                </div>
              }
              error={null}
              options={{
                cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
                cMapPacked: true,
                httpHeaders: {},
                withCredentials: false,
                verbosity: 1, // Enable debug logging
              }}
            >
              {showAllPages && numPages && workerReady ? (
                <div className="flex flex-col items-center gap-4 pb-4">
                  {Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index + 1}`} className="bg-white shadow-lg rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-2 text-center">
                        Page {index + 1} of {numPages}
                      </div>
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        rotate={rotation}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-md"
                        onRenderError={(error) => {
                          console.error(`Error rendering page ${index + 1}:`, error);
                        }}
                        loading={
                          <div className="flex items-center justify-center h-96 w-full">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-xs text-gray-500">Loading page {index + 1}...</p>
                            </div>
                          </div>
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : workerReady && numPages ? (
                <div className="bg-white shadow-lg rounded-lg p-4 flex justify-center">
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-md"
                    onRenderError={(error) => {
                      console.error(`Error rendering page ${pageNumber}:`, error);
                      setError(`Failed to render page ${pageNumber}. Please try refreshing.`);
                    }}
                    loading={
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500">Rendering page...</p>
                        </div>
                      </div>
                    }
                  />
                </div>
              ) : null}
            </Document>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-gray-600">No PDF URL provided</p>
              <p className="text-sm text-gray-400 mt-2">Please select a PDF from above</p>
            </div>
          </div>
        )}
        
        {!pdfUrl && !loading && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-gray-600">No PDF URL provided</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

