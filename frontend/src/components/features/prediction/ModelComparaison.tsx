"use client";

// frontend/src/components/features/prediction/ModelComparison.tsx

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { predictionsApi, modelsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, Trophy, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn, formatPercentage, getErrorMessage } from "@/lib/utils";
import { PredictionResult, type ModelComparison } from "@/types";
import Image from "next/image";

export function ModelComparison() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ModelComparison | null>(null);

  // Fetch models info
  const { data: modelsData } = useQuery({
    queryKey: ["models"],
    queryFn: () => modelsApi.list(),
  });

  // Compare mutation
  const compareMutation = useMutation({
    mutationFn: (file: File) => predictionsApi.compareModels(file),
    onSuccess: (data) => {
      setComparison(data.comparison);
      toast.success("Models comparison completed!");
    },
    onError: (error: unknown) => {
      //   toast.error(error.response?.data?.detail || "Comparison failed");
      getErrorMessage(error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setComparison(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }
    compareMutation.mutate(selectedFile);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Compare All Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              preview
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary"
            )}
            onClick={() =>
              document.getElementById("compare-file-input")?.click()
            }
          >
            <input
              id="compare-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <Image
                width={500}
                height={500}
                src={preview}
                alt="Preview"
                className="mx-auto max-h-64 rounded-lg"
              />
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Upload image to compare models
                </p>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCompare}
            disabled={!selectedFile || compareMutation.isPending}
          >
            {compareMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparing...
              </>
            ) : (
              "Compare All Models"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Individual Models */}
          <div className="grid gap-4 md:grid-cols-3">
            {comparison.predictions?.map(
              (pred: PredictionResult, index: number) => (
                <Card key={pred.model_id} className="relative overflow-hidden">
                  {index === 0 && (
                    <div className="absolute top-2 right-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-base">
                      {pred.model_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Prediction */}
                    <div className="text-center">
                      <Badge
                        variant={
                          pred.is_parasitized ? "destructive" : "default"
                        }
                        className="text-base px-4 py-2"
                      >
                        {pred.prediction}
                      </Badge>
                    </div>

                    {/* Confidence */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Confidence</span>
                        <span className="font-medium">
                          {formatPercentage(pred.confidence)}
                        </span>
                      </div>
                      <Progress value={pred.confidence} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-medium">
                          {pred.accuracy
                            ? formatPercentage(pred.accuracy * 100)
                            : null}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Speed</span>
                        <span className="font-medium">
                          {pred.inference_time_ms}ms
                        </span>
                      </div>
                    </div>

                    {/* Probabilities */}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex justify-between text-xs">
                        <span>Parasitized</span>
                        <span>
                          {formatPercentage(pred.probability_parasitized)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Uninfected</span>
                        <span>
                          {formatPercentage(pred.probability_uninfected)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Ensemble Result */}
          {comparison.ensemble && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Ensemble Prediction (Best Accuracy)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Badge
                      variant={
                        comparison.ensemble.is_parasitized
                          ? "destructive"
                          : "default"
                      }
                      className="text-lg px-6 py-2"
                    >
                      {comparison.ensemble.prediction}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Combined prediction from all models
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {formatPercentage(comparison.ensemble.confidence)}
                    </div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Parasitized</p>
                    <Progress
                      value={comparison.ensemble.probability_parasitized}
                      className="h-3"
                    />
                    <p className="text-xs font-medium">
                      {formatPercentage(
                        comparison.ensemble.probability_parasitized
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Uninfected</p>
                    <Progress
                      value={comparison.ensemble.probability_uninfected}
                      className="h-3"
                    />
                    <p className="text-xs font-medium">
                      {formatPercentage(
                        comparison.ensemble.probability_uninfected
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consensus */}
          {comparison.consensus && (
            <Card>
              <CardHeader>
                <CardTitle>Consensus Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {comparison.consensus.majority_vote}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Majority Vote
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {formatPercentage(
                        comparison.consensus.agreement_percentage
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Agreement</p>
                  </div>
                  <div className="text-center">
                    <Badge
                      variant={
                        comparison.consensus.unanimous ? "default" : "secondary"
                      }
                    >
                      {comparison.consensus.unanimous ? "Unanimous" : "Mixed"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Result Type
                    </p>
                  </div>
                </div>

                {/* Disagreements */}
                {comparison.disagreements &&
                  comparison.disagreements.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        Model Disagreements:
                      </p>
                      <div className="space-y-2">
                        {comparison.disagreements.map(
                          (
                            dis: {
                              model_1: string;
                              model_2: string;
                              difference: number;
                            },
                            i: number
                          ) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                            >
                              <span>
                                {dis.model_1} vs {dis.model_2}
                              </span>
                              <span className="font-medium">
                                {formatPercentage(dis.difference)} diff
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
