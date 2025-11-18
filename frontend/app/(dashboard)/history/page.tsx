'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictionsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Trash2, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { formatPercentage } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Prediction } from '@/types';

export default function HistoryPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | undefined>(
    undefined
  );
  const pageSize = 5;
  const queryClient = useQueryClient();

  // Fetch history
  const { data, isLoading } = useQuery({
    queryKey: ['predictions', 'history', page],
    queryFn: () => predictionsApi.getHistory(page * pageSize, pageSize),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => predictionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', 'history'] });
      toast.success('Prediction deleted');
    },
    onError: () => {
      toast.error('Failed to delete prediction');
    },
  });

  const predictions = data?.predictions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Filter predictions
  const filteredPredictions = predictions.filter((pred: Prediction) =>
    pred.image_filename.toLowerCase().includes(search.toLowerCase()) ||
    pred.prediction.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this prediction?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prediction History</h1>
          <p className="text-muted-foreground">
            View and manage your past predictions
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by filename or result..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredPredictions.length} Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredPredictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No predictions found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPredictions.map((prediction: Prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell className="font-medium">
                        {prediction.image_filename}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={prediction.is_parasitized ? 'destructive' : 'default'}
                        >
                          {prediction.prediction}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatPercentage(prediction.confidence)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prediction.model_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(prediction.created_at), 'PPp')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPrediction(prediction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(prediction.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {page * pageSize + 1} to{' '}
                  {Math.min((page + 1) * pageSize, total)} of {total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={selectedPrediction !== undefined} onOpenChange={() => setSelectedPrediction(undefined)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
          </DialogHeader>
          {selectedPrediction !== undefined && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Image</p>
                  <p className="font-medium">{selectedPrediction.image_filename}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Result</p>
                  <Badge variant={selectedPrediction.is_parasitized ? 'destructive' : 'default'}>
                    {selectedPrediction.prediction}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="font-medium">{formatPercentage(selectedPrediction.confidence)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">{selectedPrediction.model_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parasitized Probability</p>
                  <p className="font-medium">
                    {formatPercentage(selectedPrediction.probability_parasitized)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uninfected Probability</p>
                  <p className="font-medium">
                    {formatPercentage(selectedPrediction.probability_uninfected)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedPrediction.created_at), 'PPpp')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Processing Time</p>
                  <p className="font-medium">{selectedPrediction.inference_time_ms?.toFixed(0)}ms</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}