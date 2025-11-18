'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPercentage } from '@/lib/utils';
import { toast } from 'sonner';
import { ModelInfo } from '@/types';
import { Cpu } from 'lucide-react';

export default function ModelsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['models'],
    queryFn: () => modelsApi.list(),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (modelId: string) => modelsApi.setDefault(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast.success('Default model updated');
    },
  });

  const models = data?.models || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Models</h1>
        <p className="text-muted-foreground">
          Compare and manage detection models
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model: ModelInfo) => (
          <Card key={model.id} className={model.is_default ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                </div>
                {model.is_default && (
                  <Badge variant="default">Default</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-medium">{formatPercentage(model.accuracy * 100)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Speed</span>
                  <span className="font-medium">{model.inference_time_ms}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parameters</span>
                  <span className="font-medium">{model.parameters}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{model.use_case}</p>

              {!model.is_default && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setDefaultMutation.mutate(model.id)}
                  disabled={setDefaultMutation.isPending}
                >
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
