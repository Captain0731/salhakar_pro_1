import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import axios from "axios";
import { FileText } from "lucide-react";

// Set up pdf.js worker - use local .mjs file from public folder
if (typeof window !== 'undefined') {
  // Use local worker file from public folder (copied from node_modules)
  // This avoids CDN issues and network dependencies
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  
  // Alternative CDN options (if local file doesn't work):
  // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * TranslatedPDF Component
 * 
 * Extracts text from PDF, translates it using Google Translate API,
 * and displays the translated text in a scrollable Tailwind-styled container.
 * 
 * Smart Translation Logic:
 * - If source is English → translate directly to target
 * - If source is not English and target is not English → translate to English first, then to target
 *   (This is faster because LLMs are trained on specific language pairs)
 */
export default function TranslatedPDF({ fileUrl, targetLang = "en", sourceLang = "en" }) {
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAndTranslate = async () => {
      try {
        setLoading(true);
        setError(null);
        setTranslatedText("");

        console.log("📄 Loading PDF from URL:", fileUrl);

        // Check if URL is accessible first
        try {
          const testResponse = await fetch(fileUrl, { method: 'HEAD' });
          if (!testResponse.ok && testResponse.status !== 0) {
            throw new Error(`PDF not found (Status: ${testResponse.status})`);
          }
        } catch (fetchError) {
          console.warn("PDF URL check failed, continuing anyway:", fetchError);
        }

        // 1️⃣ Load PDF from URL
        console.log("📄 Initializing PDF.js document...");
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          withCredentials: false,
          httpHeaders: {},
        });

        const pdf = await loadingTask.promise;
        console.log("✅ PDF loaded successfully. Pages:", pdf.numPages);

        // 2️⃣ Extract text from all pages
        let extractedText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          console.log(`📄 Extracting text from page ${i}/${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(" ");
          extractedText += pageText + "\n\n";
        }

        console.log("✅ Text extracted. Length:", extractedText.length);

        if (!extractedText.trim()) {
          console.warn("⚠️ No text found in PDF. It might be a scanned image.");
          setTranslatedText("No text content found in this PDF. The PDF might be a scanned image or the text is not extractable.");
          setLoading(false);
          return;
        }

        // 3️⃣ Smart Translation Logic
        // If target is English, no translation needed
        if (targetLang === "en") {
          setTranslatedText(extractedText);
          setLoading(false);
          return;
        }

        // Smart translation routing
        const needsTwoStepTranslation = sourceLang !== "en" && targetLang !== "en";
        
        if (needsTwoStepTranslation) {
          console.log(`🌐 Two-step translation: ${sourceLang} → English → ${targetLang}`);
          console.log(`   Step 1: Translating from ${sourceLang} to English...`);
        } else {
          console.log(`🌐 Direct translation: ${sourceLang} → ${targetLang}`);
        }

        try {
          // Split long text into chunks for translation
          const maxChunkLength = 5000;
          const chunks = [];
          for (let i = 0; i < extractedText.length; i += maxChunkLength) {
            chunks.push(extractedText.substring(i, i + maxChunkLength));
          }

          // Helper function to translate a chunk
          const translateChunk = async (chunk, fromLang, toLang) => {
            try {
              const response = await axios.get(
                "https://translate.googleapis.com/translate_a/single",
                {
                  params: {
                    client: "gtx",
                    sl: fromLang,
                    tl: toLang,
                    dt: "t",
                    q: chunk,
                  },
                  timeout: 30000,
                }
              );

              if (response.data && response.data[0]) {
                return response.data[0].map((seg) => seg[0]).join(" ");
              }
              return chunk;
            } catch (chunkError) {
              console.warn(`Translation chunk failed (${fromLang} → ${toLang}):`, chunkError);
              return chunk; // Return original chunk on error
            }
          };

          let translated;

          if (needsTwoStepTranslation) {
            // Step 1: Translate from source language to English
            console.log(`   Translating ${chunks.length} chunks from ${sourceLang} to English...`);
            const englishChunks = await Promise.all(
              chunks.map((chunk, index) => {
                console.log(`   Chunk ${index + 1}/${chunks.length}: ${sourceLang} → English`);
                return translateChunk(chunk, sourceLang, "en");
              })
            );
            const englishText = englishChunks.join(" ");
            console.log(`   ✅ Step 1 complete: Translated to English`);

            // Step 2: Translate from English to target language
            console.log(`   Step 2: Translating from English to ${targetLang}...`);
            const englishChunksForStep2 = [];
            for (let i = 0; i < englishText.length; i += maxChunkLength) {
              englishChunksForStep2.push(englishText.substring(i, i + maxChunkLength));
            }

            const targetChunks = await Promise.all(
              englishChunksForStep2.map((chunk, index) => {
                console.log(`   Chunk ${index + 1}/${englishChunksForStep2.length}: English → ${targetLang}`);
                return translateChunk(chunk, "en", targetLang);
              })
            );
            translated = targetChunks.join(" ");
            console.log(`   ✅ Step 2 complete: Translated to ${targetLang}`);
          } else {
            // Direct translation: source → target (or English → target)
            const fromLang = sourceLang === "en" ? "en" : sourceLang;
            console.log(`   Translating ${chunks.length} chunks from ${fromLang} to ${targetLang}...`);
            const translatedChunks = await Promise.all(
              chunks.map((chunk, index) => {
                console.log(`   Chunk ${index + 1}/${chunks.length}: ${fromLang} → ${targetLang}`);
                return translateChunk(chunk, fromLang, targetLang);
              })
            );
            translated = translatedChunks.join(" ");
            console.log(`   ✅ Translation complete: ${fromLang} → ${targetLang}`);
          }

          setTranslatedText(translated);
          console.log("✅ All translations complete");
        } catch (translateError) {
          console.error("Translation error:", translateError);
          setTranslatedText(extractedText); // Fallback to original text
        }
      } catch (err) {
        console.error("❌ PDF loading error:", err);
        console.error("Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });

        let errorMessage = "Failed to load PDF.";
        
        if (err.name === 'InvalidPDFException') {
          errorMessage = "Invalid PDF file. The file might be corrupted or not a valid PDF.";
        } else if (err.message?.includes('CORS') || err.message?.includes('Network')) {
          errorMessage = `Unable to load PDF from: ${fileUrl}\n\nPossible causes:\n- PDF file does not exist at this location\n- CORS restrictions\n- Network connectivity issues\n\nPlease check the PDF URL and ensure the file is accessible.`;
        } else if (err.message?.includes('404') || err.message?.includes('not found')) {
          errorMessage = `PDF file not found at: ${fileUrl}\n\nPlease ensure the PDF file exists in the public/pdfs/ folder.`;
        } else {
          errorMessage = `Failed to load PDF: ${err.message || 'Unknown error'}\n\nPDF URL: ${fileUrl}`;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (fileUrl) {
      loadAndTranslate();
    } else {
      setError("No PDF URL provided");
      setLoading(false);
    }
  }, [fileUrl, targetLang, sourceLang]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="relative mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="text-lg font-semibold text-gray-600">
          Translating your PDF, please wait...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Extracting and translating text content
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold mb-2">Error Loading PDF</p>
            <p className="text-sm whitespace-pre-line">{error}</p>
            {fileUrl && (
              <div className="mt-4 p-3 bg-red-100 rounded border border-red-300">
                <p className="text-xs font-medium mb-1">PDF URL:</p>
                <p className="text-xs break-all font-mono">{fileUrl}</p>
              </div>
            )}
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                const loadAndTranslate = async () => {
                  // Retry logic would go here
                  window.location.reload();
                };
                loadAndTranslate();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Fallback: Open PDF in new tab button */}
      {translatedText && (
        <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            PDF content loaded successfully
          </p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Open Original PDF
          </a>
        </div>
      )}

      <div 
        className="w-full bg-white rounded-xl p-4 sm:p-6 md:p-8 text-gray-800 leading-relaxed whitespace-pre-wrap overflow-y-auto border border-gray-200"
        style={{
          height: 'calc(90vh - 120px)',
          minHeight: '400px',
          maxHeight: '800px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f1f1',
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            width: 8px;
          }
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 8px;
          }
          div::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 8px;
            border: 2px solid #f1f1f1;
          }
          div::-webkit-scrollbar-thumb:hover {
            background-color: #94a3b8;
          }
        `}</style>
        {translatedText ? (
          <div className="prose prose-lg max-w-none">
            {translatedText.split('\n').map((line, index) => (
              <p key={index} className="mb-2 last:mb-0">
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No text found in this PDF.</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <FileText className="h-4 w-4" />
              Open PDF in New Tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

