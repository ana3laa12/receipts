
import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, Loader2, AlertCircle, Camera, ImagePlus } from 'lucide-react';
import { analyzeInvoiceImage } from '../services/geminiService';
import { InvoiceData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InvoiceUploaderProps {
  onScanComplete: (data: InvoiceData) => void;
}

export const InvoiceUploader: React.FC<InvoiceUploaderProps> = ({ onScanComplete }) => {
  const { t, language } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processSingleFile = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(t('invalidFile'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        reject('File size exceeds 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const results = await analyzeInvoiceImage(base64String, language);
          
          if (results && results.length > 0) {
            results.forEach((result: any) => {
              const newInvoice: InvoiceData = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                patientName: result.patientName || t('unknown'),
                procedure: result.procedure || t('unknown'),
                price: result.price || '0',
                date: result.date || new Date().toISOString().split('T')[0],
                dayName: result.dayName || '',
                status: 'completed',
                originalImage: base64String
              };
              onScanComplete(newInvoice);
            });
            resolve();
          } else {
            reject(t('noInvoicesFound'));
          }
        } catch (err) {
          console.error(err);
          reject(t('analysisFailed'));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setError(null);
    setIsAnalyzing(true);
    setProcessingCount(fileArray.length);

    let successCount = 0;
    let failCount = 0;

    for (const file of fileArray) {
      try {
        await processSingleFile(file);
        successCount++;
      } catch (err) {
        console.error(err);
        failCount++;
      }
      setProcessingCount(prev => prev - 1);
    }

    setIsAnalyzing(false);
    if (failCount > 0) {
      setError(t('successError', { success: successCount, fail: failCount }));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [onScanComplete, language, t]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  return (
    <div className="w-full mb-6 md:mb-8">
      <div
        className={`relative group border-2 border-dashed rounded-2xl p-6 md:p-12 transition-all duration-300 ease-in-out text-center cursor-pointer
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept="image/*"
          multiple
          disabled={isAnalyzing}
        />
        <input
          ref={cameraInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept="image/*"
          capture="environment"
          disabled={isAnalyzing}
        />

        <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4">
          {isAnalyzing ? (
            <div className="flex flex-col items-center animate-pulse">
              <div className="p-3 md:p-4 bg-primary-100 dark:bg-primary-900/50 rounded-full mb-3 md:mb-4">
                <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-primary-600 dark:text-primary-400 animate-spin" />
              </div>
              <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-200">
                {t('analyzing', { count: processingCount > 0 ? processingCount : '' })}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('aiNote')}</p>
            </div>
          ) : (
            <>
              <div className={`p-3 md:p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-primary-200 dark:bg-primary-800' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'}`}>
                <UploadCloud className={`w-8 h-8 md:w-10 md:h-10 ${isDragging ? 'text-primary-700 dark:text-primary-300' : 'text-gray-400 dark:text-gray-300 group-hover:text-primary-500'}`} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-700 dark:text-gray-100 mb-1 md:mb-2">
                  {t('dropTitle')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  {t('dropSub')}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-all shadow-sm hover:shadow-md text-sm md:text-base"
                >
                  <ImagePlus size={18} className="md:w-5 md:h-5" />
                  <span>{t('chooseFiles')}</span>
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm md:text-base"
                >
                  <Camera size={18} className="md:w-5 md:h-5" />
                  <span>{t('capturePhoto')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300 animate-in fade-in slide-in-from-top-2 text-sm md:text-base">
          <AlertCircle size={18} className="md:w-5 md:h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
