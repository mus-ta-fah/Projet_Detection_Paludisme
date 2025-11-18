
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">About the Project</h1>
        <p className="text-muted-foreground">
          Learn about our malaria detection system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            This platform uses advanced deep learning techniques to detect malaria
            parasites in blood cell images. Our system achieves{' '}
            <strong>95.89% accuracy</strong>, providing fast and reliable diagnostics.
          </p>

          <h3>Technology Stack</h3>
          <div className="flex flex-wrap gap-2 not-prose">
            <Badge>Next.js 14</Badge>
            <Badge>TypeScript</Badge>
            <Badge>Tailwind CSS</Badge>
            <Badge>FastAPI</Badge>
            <Badge>TensorFlow</Badge>
            <Badge>PostgreSQL</Badge>
          </div>

          <h3>Features</h3>
          <ul>
            <li>Three state-of-the-art CNN models</li>
            <li>Real-time image analysis (&lt;1 second)</li>
            <li>Comprehensive statistics and analytics</li>
            <li>PDF export for medical reports</li>
            <li>Multi-user support with authentication</li>
          </ul>

          <h3>Dataset</h3>
          <p>
            Trained on over 27,000 verified blood cell images from the NIH Malaria
            Dataset, ensuring high accuracy and reliability.
          </p>

          <h3>Team</h3>
          <p>
            Developed by Master 1 DSGL students at Université Alioune Diop de Bambey
            (UADB) as part of a Deep Learning course project.
          </p>

          <h3>Contact</h3>
          <p>
            For inquiries or support, please contact us at{' '}
            <a href="mailto:support@malaria-detection.com">
              support@malaria-detection.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}