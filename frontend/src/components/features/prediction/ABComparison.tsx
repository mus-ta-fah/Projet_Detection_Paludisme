'use client';


import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { predictionsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, ArrowRight, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatPercentage } from '@/lib/utils';
import { PredictionResponse } from '@/types';
import Image from 'next/image';

interface ImageData {
  file: File | null;
  preview: string | null;
  result: PredictionResponse | null;
  isAnalyzing: boolean;
}

export function ABComparison() {
  const [imageA, setImageA] = useState<ImageData>({
    file: null,
    preview: null,
    result: null,
    isAnalyzing: false,
  });

  const [imageB, setImageB] = useState<ImageData>({
    file: null,
    preview: null,
    result: null,
    isAnalyzing: false,
  });

  // Prediction mutations
  const predictMutationA = useMutation({
    mutationFn: (file: File) => predictionsApi.predict(file),
    onSuccess: (data) => {
      setImageA(prev => ({ ...prev, result: data, isAnalyzing: false }));
      toast.success('Image A analyzed!');
    },
    onError: () => {
      setImageA(prev => ({ ...prev, isAnalyzing: false }));
      toast.error('Analysis failed for Image A');
    },
  });

  const predictMutationB = useMutation({
    mutationFn: (file: File) => predictionsApi.predict(file),
    onSuccess: (data) => {
      setImageB(prev => ({ ...prev, result: data, isAnalyzing: false }));
      toast.success('Image B analyzed!');
    },
    onError: () => {
      setImageB(prev => ({ ...prev, isAnalyzing: false }));
      toast.error('Analysis failed for Image B');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = {
          file,
          preview: reader.result as string,
          result: null,
          isAnalyzing: false,
        };
        
        if (side === 'A') {
          setImageA(imageData);
        } else {
          setImageB(imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = (side: 'A' | 'B') => {
    const image = side === 'A' ? imageA : imageB;
    if (!image.file) {
      toast.error('Please select an image first');
      return;
    }

    if (side === 'A') {
      setImageA(prev => ({ ...prev, isAnalyzing: true }));
      predictMutationA.mutate(image.file);
    } else {
      setImageB(prev => ({ ...prev, isAnalyzing: true }));
      predictMutationB.mutate(image.file);
    }
  };

  const analyzeAll = () => {
    if (!imageA.file || !imageB.file) {
      toast.error('Please select both images');
      return;
    }
    analyzeImage('A');
    analyzeImage('B');
  };

  const clearImage = (side: 'A' | 'B') => {
    if (side === 'A') {
      if (imageA.preview) URL.revokeObjectURL(imageA.preview);
      setImageA({ file: null, preview: null, result: null, isAnalyzing: false });
    } else {
      if (imageB.preview) URL.revokeObjectURL(imageB.preview);
      setImageB({ file: null, preview: null, result: null, isAnalyzing: false });
    }
  };

  const getDifference = () => {
    if (!imageA.result || !imageB.result) return null;
    
    const diffConfidence = Math.abs(
      imageA.result.result.confidence - imageB.result.result.confidence
    );
    
    const sameResult = imageA.result.result.is_parasitized === imageB.result.result.is_parasitized;
    
    return { diffConfidence, sameResult };
  };

  const comparison = getDifference();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>A/B Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare two cell images side by side
          </p>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            size="lg"
            onClick={analyzeAll}
            disabled={!imageA.file || !imageB.file || imageA.isAnalyzing || imageB.isAnalyzing}
          >
            {imageA.isAnalyzing || imageB.isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Both Images'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Image Comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Image A */}
        <ImagePanel
          label="Image A"
          image={imageA}
          onFileChange={(e) => handleFileChange(e, 'A')}
          onAnalyze={() => analyzeImage('A')}
          onClear={() => clearImage('A')}
          inputId="file-a"
        />

        {/* Image B */}
        <ImagePanel
          label="Image B"
          image={imageB}
          onFileChange={(e) => handleFileChange(e, 'B')}
          onAnalyze={() => analyzeImage('B')}
          onClear={() => clearImage('B')}
          inputId="file-b"
        />
      </div>

      {/* Comparison Results */}
      {comparison && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Comparison Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Result Match</p>
                <Badge variant={comparison.sameResult ? 'default' : 'destructive'} className="text-lg">
                  {comparison.sameResult ? 'Same' : 'Different'}
                </Badge>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Confidence Difference</p>
                <p className="text-2xl font-bold">{formatPercentage(comparison.diffConfidence)}</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Agreement Level</p>
                <Badge variant={comparison.diffConfidence < 10 ? 'default' : 'secondary'}>
                  {comparison.diffConfidence < 10 ? 'High' : comparison.diffConfidence < 30 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>

            {!comparison.sameResult && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ⚠️ Conflicting Results Detected
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  The two images produced different predictions. Consider reviewing both samples carefully.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Image Panel Component
function ImagePanel({
  label,
  image,
  onFileChange,
  onAnalyze,
  onClear,
  inputId,
}: {
  label: string;
  image: ImageData;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onClear: () => void;
  inputId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {label}
          {image.file && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            image.preview ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
          )}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          {image.preview ? (
            <Image width={500} height={500} src={image.preview} alt={label} className="mx-auto max-h-64 rounded-lg" />
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">Upload {label}</p>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <Button
          className="w-full"
          onClick={onAnalyze}
          disabled={!image.file || image.isAnalyzing}
        >
          {image.isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            `Analyze ${label}`
          )}
        </Button>

        {/* Results */}
        {image.result && (
          <div className="space-y-3 pt-4 border-t">
            <div className="text-center">
              <Badge
                variant={image.result.result.is_parasitized ? 'destructive' : 'default'}
                className="text-base px-4 py-2"
              >
                {image.result.result.prediction}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confidence</span>
                <span className="font-medium">{formatPercentage(image.result.result.confidence)}</span>
              </div>
              <Progress value={image.result.result.confidence} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Parasitized</p>
                <p className="font-medium">{formatPercentage(image.result.result.probability_parasitized)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Uninfected</p>
                <p className="font-medium">{formatPercentage(image.result.result.probability_uninfected)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}