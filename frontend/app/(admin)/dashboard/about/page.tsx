'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, Users, Code, Database, Cpu, TrendingUp, 
  Target, Zap, Globe, BookOpen, Github, Linkedin, Mail,
  CheckCircle2, ArrowRight, ExternalLink,
  BarChart3
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-12 text-center">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">About the Project</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionizing malaria detection through artificial intelligence and deep learning
          </p>
        </div>
        <div className="absolute inset-0 bg-grid-white/10" />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">95.69%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">27K+</div>
            <div className="text-sm text-muted-foreground">Training Images</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-sm text-muted-foreground">AI Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{'<1s'}</div>
            <div className="text-sm text-muted-foreground">Analysis Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Mission Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="text-lg">
                Our mission is to democratize access to accurate malaria diagnostics through
                cutting-edge artificial intelligence, making early detection faster, more reliable,
                and accessible to communities worldwide.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>The Problem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-red-500 mt-0.5" />
                  <p className="text-sm">228 million malaria cases worldwide annually</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-red-500 mt-0.5" />
                  <p className="text-sm">Manual microscopy requires expert technicians</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-red-500 mt-0.5" />
                  <p className="text-sm">Time-consuming and prone to human error</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-red-500 mt-0.5" />
                  <p className="text-sm">Limited access in remote areas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm">95.69% accuracy with AI ensemble models</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm">Results in less than 1 second</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm">Cloud-based, accessible anywhere</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm">Reduces burden on healthcare workers</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {features.map((feature, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technology Tab */}
        <TabsContent value="technology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Backend & ML
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {backendStack.map(tech => (
                      <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Frontend
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {frontendStack.map(tech => (
                      <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {models.map((model, i) => (
                <div key={i} className="border-l-4 border-primary pl-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{model.name}</h3>
                    <Badge>{model.accuracy}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Layers</div>
                      <div className="font-medium">{model.layers}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Parameters</div>
                      <div className="font-medium">{model.params}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Speed</div>
                      <div className="font-medium">{model.speed}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dataset
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <ul className="space-y-2">
                <li><strong>Source:</strong> NIH Malaria Dataset</li>
                <li><strong>Total Images:</strong> 27,558 cell images</li>
                <li><strong>Classes:</strong> Parasitized (infected) and Uninfected</li>
                <li><strong>Split:</strong> 70% training, 15% validation, 15% testing</li>
                <li><strong>Preprocessing:</strong> Resized to 64x64, normalized, augmented</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Development Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Master 1 Data Science et Génie Logiciel - Université Alioune Diop de Bambey (UADB)
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="text-center p-4">
                    <div className="h-20 w-20 rounded-full bg-linear-to-br from-primary to-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold">Team Member {i}</h3>
                    <p className="text-sm text-muted-foreground">Developer</p>
                    <div className="flex justify-center gap-2 mt-3">
                      <Button size="sm" variant="ghost"><Github className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><Linkedin className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acknowledgments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>We would like to thank:</p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Université Alioune Diop de Bambey (UADB) for academic support</li>
                <li>NIH for providing the malaria dataset</li>
                <li>Our professors and supervisors for their guidance</li>
                <li>Open-source community for amazing tools and frameworks</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Project Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {roadmap.map((phase, i) => (
                  <div key={i} className="relative pl-8 border-l-2 border-primary">
                    <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'}>
                          {phase.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{phase.date}</span>
                      </div>
                      <h3 className="font-semibold text-lg">{phase.title}</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {phase.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Future Enhancements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {futureFeatures.map((feature, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg border">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CTA */}
      <Card className="bg-linear-to-br from-primary/10 to-purple-500/10">
        <CardContent className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Want to Learn More?</h2>
          <p className="text-muted-foreground">
            Check out our documentation or get in touch with the team
          </p>
          <div className="flex justify-center gap-3">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Documentation
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const features = [
  { icon: Zap, title: "Real-time Analysis", description: "Get results in under 1 second" },
  { icon: Target, title: "High Accuracy", description: "95.69% detection accuracy" },
  { icon: Globe, title: "Cloud-based", description: "Access from anywhere" },
  { icon: Users, title: "Multi-user", description: "Team collaboration" },
  { icon: BarChart3, title: "Analytics", description: "Track performance" },
  { icon: Award, title: "Certified", description: "Medical-grade quality" },
];

const backendStack = ["FastAPI", "TensorFlow", "Keras", "PostgreSQL", "Python", "Docker"];
const frontendStack = ["Next.js 16", "TypeScript", "Tailwind CSS", "shadcn/ui", "React Query"];

const models = [
  { 
    name: "Model 1: CNN Simple", 
    accuracy: "95.21%", 
    description: "Baseline convolutional neural network",
    layers: "2 Conv blocks",
    params: "1.6M",
    speed: "50ms"
  },
  { 
    name: "Model 2: CNN BatchNorm", 
    accuracy: "95.69%", 
    description: "Enhanced with batch normalization",
    layers: "3 Conv blocks",
    params: "2.2M",
    speed: "80ms"
  },
  { 
    name: "Model 3: Deep VGG", 
    accuracy: "95.65%", 
    description: "Deep architecture inspired by VGG",
    layers: "6 Conv blocks",
    params: "9.7M",
    speed: "120ms"
  },
];

const roadmap = [
  {
    status: "completed",
    date: "Phase 1 - Nov 2024",
    title: "Project Foundation",
    items: ["Dataset acquisition and preprocessing", "Model architecture design", "Initial training pipeline"]
  },
  {
    status: "completed",
    date: "Phase 2 - Nov 2024",
    title: "Model Development",
    items: ["Training 3 CNN models", "Ensemble implementation", "Achieving 95.89% accuracy"]
  },
  {
    status: "completed",
    date: "Phase 3 - Nov 2024",
    title: "Platform Development",
    items: ["Backend API with FastAPI", "Frontend with Next.js", "User authentication"]
  },
  {
    status: "in-progress",
    date: "Phase 4 - Dec 2024",
    title: "Advanced Features",
    items: ["Batch processing", "Model comparison", "PDF, Excel & CSV export"]
  },
];

const futureFeatures = [
  { title: "Mobile App", description: "iOS and Android native applications" },
  { title: "Multi-species Detection", description: "Detect different Plasmodium species" },
  { title: "Integration API", description: "Hospital management system integration" },
  { title: "Offline Mode", description: "Works without internet connection" },
];