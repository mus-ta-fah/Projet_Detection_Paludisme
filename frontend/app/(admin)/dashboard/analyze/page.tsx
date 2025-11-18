"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { predictionsApi, modelsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatPercentage, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ModelInfo, PredictionResponse, PredictionResult } from "@/types";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BatchUploader } from "@/components/features/upload/BatchUploader";
import { ModelComparison } from "@/components/features/prediction/ModelComparaison";
import { ABComparison } from "@/components/features/prediction/ABComparison";
import { exportPredictionToPDF } from "@/lib/pdf-export";
import { HeatmapVisualization } from "@/components/features/prediction/HeatmapVisualization";

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const [preview, setPreview] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("model_1");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);
  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ["models"],
    queryFn: () => modelsApi.list(),
  });

  // Prediction mutation
  const predictMutation = useMutation({
    mutationFn: (data: { file: File; modelId: string }) =>
      predictionsApi.predict(data.file, data.modelId),
    onSuccess: (data) => {
      console.log(data);

      setPredictionResult(data.result as PredictionResult);
      setResult(data);
      toast.success("Analysis completed!");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message || "Analysis failed");
      } else {
        toast.error("Analysis failed");
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setResult(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }
    predictMutation.mutate({ file: selectedFile, modelId: selectedModel });
  };

  const handleExportPDF = async () => {
    if (!result) return;

    try {
      await exportPredictionToPDF(
        {
          result: result.result,
          image_filename: selectedFile?.name || "unknown",
          created_at: result.created_at,
        },
        preview // L'image en base64
      );
      toast.success("PDF exported successfully!");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analyze Cell Image</h1>
        <p className="text-muted-foreground">
          Upload a blood cell image to detect malaria parasites
        </p>
        <p className="text-muted-foreground">
          Multiple analysis modes for comprehensive malaria detection
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="single" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single Analysis</TabsTrigger>
          <TabsTrigger value="batch">Batch Upload</TabsTrigger>
          <TabsTrigger value="compare">Compare Models</TabsTrigger>
          <TabsTrigger value="ab">A/B Comparison</TabsTrigger>
        </TabsList>

        {/* Single Analysis - Votre code existant */}
        <TabsContent value="single">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label>Select Model</Label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelsData?.models?.map((model: ModelInfo) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} -{" "}
                          {formatPercentage(model.accuracy * 100)} accuracy
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    selectedFile
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary"
                  )}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {preview ? (
                    <div className="space-y-4">
                      <Image
                        src={preview}
                        alt="Preview"
                        className="mx-auto max-h-64 rounded-lg"
                        width={256}
                        height={256}
                      />
                      <p className="text-sm text-muted-foreground">
                        {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Drop image here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG or JPEG (max 16MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Analyze Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={!selectedFile || predictMutation.isPending}
                >
                  {predictMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Image"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    {/* Prediction */}
                    <div className="space-y-2">
                      <Label>Prediction</Label>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            result.result.is_parasitized
                              ? "destructive"
                              : "default"
                          }
                          className="text-lg px-4 py-2"
                        >
                          {predictionResult?.prediction}
                        </Badge>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Confidence</Label>
                        <span className="text-sm font-medium">
                          {formatPercentage(predictionResult?.confidence || 0)}
                        </span>
                      </div>
                      <Progress
                        value={predictionResult?.confidence || 0}
                        className="h-3"
                      />
                    </div>

                    {/* Probabilities */}
                    <div className="space-y-3">
                      <Label>Detailed Probabilities</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Parasitized</span>
                          <span className="text-sm font-medium">
                            {formatPercentage(
                              predictionResult?.probability_parasitized || 0
                            )}
                          </span>
                        </div>
                        <Progress
                          value={predictionResult?.probability_parasitized || 0}
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Uninfected</span>
                          <span className="text-sm font-medium">
                            {formatPercentage(
                              predictionResult?.probability_uninfected || 0
                            )}
                          </span>
                        </div>
                        <Progress
                          value={predictionResult?.probability_uninfected || 0}
                          className="h-2"
                        />
                      </div>
                    </div>

                    {/* Model Info */}
                    <div className="space-y-2 border-t pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Model Used
                        </span>
                        <span className="font-medium">
                          {predictionResult?.model_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Processing Time
                        </span>
                        <span className="font-medium">
                          {predictionResult?.inference_time_ms?.toFixed(0)}ms
                        </span>
                      </div>
                    </div>
                    {result && <HeatmapVisualization preview={preview} />}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleExportPDF}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview("");
                          setResult(null);
                        }}
                      >
                        New Analysis
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                    <div className="space-y-2">
                      <FileText className="mx-auto h-12 w-12" />
                      <p>Upload an image to see results</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Batch Upload */}
        <TabsContent value="batch">
          <BatchUploader />
        </TabsContent>

        {/* Compare Models */}
        <TabsContent value="compare">
          <ModelComparison />
        </TabsContent>

        {/* A/B Comparison */}
        <TabsContent value="ab">
          {/* Votre composant ABComparison ici */}
          <ABComparison />
        </TabsContent>
      </Tabs>
    </div>
  );
}
