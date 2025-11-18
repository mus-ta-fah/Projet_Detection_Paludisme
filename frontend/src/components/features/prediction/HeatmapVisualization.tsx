"use client";

// frontend/src/components/features/prediction/HeatmapVisualization.tsx

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, EyeOff, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function HeatmapVisualization() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [opacity, setOpacity] = useState([70]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowHeatmap(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateHeatmap = () => {
    if (!preview) return;

    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Generate pseudo-heatmap based on color intensity
    // In a real implementation, this would come from the model's attention/activation maps
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      // Calculate intensity
      const intensity = (red + green + blue) / 3;

      // Generate heatmap color (red = high attention, blue = low attention)
      if (intensity > 150) {
        // High intensity areas - more red
        data[i] = Math.min(255, data[i] + 100); // R
        data[i + 1] = Math.max(0, data[i + 1] - 50); // G
        data[i + 2] = Math.max(0, data[i + 2] - 50); // B
      } else if (intensity > 100) {
        // Medium intensity - yellow
        data[i] = Math.min(255, data[i] + 50); // R
        data[i + 1] = Math.min(255, data[i + 1] + 50); // G
        data[i + 2] = Math.max(0, data[i + 2] - 30); // B
      } else {
        // Low intensity - blue
        data[i] = Math.max(0, data[i] - 30); // R
        data[i + 1] = Math.max(0, data[i + 1] - 30); // G
        data[i + 2] = Math.min(255, data[i + 2] + 50); // B
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setShowHeatmap(true);
    toast.success("Heatmap generated!");
  };

  const downloadHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "heatmap-visualization.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Heatmap downloaded!");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attention Heatmap Visualization</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualize where the model focuses its attention
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              preview
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary"
            )}
            onClick={() =>
              document.getElementById("heatmap-file-input")?.click()
            }
          >
            <input
              id="heatmap-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <Image
                    width={500}
                    height={500}
                    ref={imgRef}
                    src={preview}
                    alt="Preview"
                    className="max-h-64 rounded-lg"
                    crossOrigin="anonymous"
                  />
                  {showHeatmap && (
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 rounded-lg"
                      style={{
                        opacity: opacity[0] / 100,
                        mixBlendMode: "multiply",
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium">Upload image for heatmap</p>
              </div>
            )}
          </div>

          {/* Controls */}
          {preview && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={generateHeatmap}
                  disabled={showHeatmap}
                  className="flex-1"
                >
                  Generate Heatmap
                </Button>
                {showHeatmap && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowHeatmap(false)}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={downloadHeatmap}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Opacity Slider */}
              {showHeatmap && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Heatmap Opacity
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {opacity[0]}%
                    </span>
                  </div>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          {showHeatmap && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium mb-3">Heatmap Legend</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-sm">
                  High Attention (Important regions)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span className="text-sm">Medium Attention</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm">Low Attention</span>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This is a visualization representation. In
              production, this would integrate with actual Grad-CAM or attention
              maps from the model.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
