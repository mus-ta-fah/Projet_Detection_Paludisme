'use client';

// frontend/src/components/features/upload/BatchUploader.tsx

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { predictionsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatPercentage, getErrorMessage } from '@/lib/utils';
import { PredictionResult } from '@/types';
import Image from 'next/image';

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: PredictionResult;
  error?: string;
}

export interface PredictionResponse {
  success: boolean;
  prediction_id: number;
  result: PredictionResult;
  filename: string;
  inference_time_ms: number;
  created_at: string;
}

export function BatchUploader() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mutation pour batch prediction
  const batchMutation = useMutation({
    mutationFn: (files: File[]) => predictionsApi.batchPredict(files),
    onSuccess: (data) => {
      toast.success(`${data.successful} images analyzed successfully!`);
      
      // Update files with results
      // Le backend renomme les fichiers donc on ne peut pas lier le résultat avec filename.
      // On suppose que l'ordre des résultats correspond à l'ordre d'envoi des fichiers (attention à la robustesse si le backend change !)
      if (data.results) {
        setFiles(prev => prev.map((f, i) => {
          const result = data.results[i];
          if (result?.success) {
            return { ...f, status: 'success', result: result.result };
          }
          return f;
        }));
      }
    },
    onError: (error: unknown) => {
    //   toast.error(error.response?.data?.detail || 'Batch analysis failed');
    getErrorMessage(error)
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const newFiles: FileWithPreview[] = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
      f.type.startsWith('image/')
    );

    if (droppedFiles.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const newFiles: FileWithPreview[] = droppedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const analyzeAll = async () => {
    if (files.length === 0) {
      toast.error('Please select images first');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);

    try {
      await batchMutation.mutateAsync(files.map(f => f.file));
      setProgress(100);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setProgress(0);
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              files.length > 0 ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('batch-file-input')?.click()}
          >
            <input
              id="batch-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Upload Multiple Images
            </p>
            <p className="text-sm text-muted-foreground">
              Drop images here or click to browse (Max 10 images)
            </p>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {files.length} image{files.length > 1 ? 's' : ''} selected
                </p>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {files.map((file) => (
                  <div key={file.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-border">
                      <Image
                      width={500}
                      height={500}
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {file.status === 'success' && (
                        <CheckCircle2 className="h-6 w-6 text-green-500 bg-white rounded-full" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-6 w-6 text-red-500 bg-white rounded-full" />
                      )}
                      {file.status === 'uploading' && (
                        <Loader2 className="h-6 w-6 text-blue-500 bg-white rounded-full animate-spin" />
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-6 w-6 text-white bg-red-500 rounded-full p-1" />
                    </button>

                    {/* Result */}
                    {file.result && (
                      <div className="mt-2 text-center">
                        <Badge variant={file.result.is_parasitized ? 'destructive' : 'default'}>
                          {file.result.prediction}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatPercentage(file.result.confidence)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analyzing images...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Summary */}
          {successCount > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">{successCount} Successful</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">{errorCount} Failed</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={analyzeAll}
              disabled={files.length === 0 || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                `Analyze ${files.length} Image${files.length > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}