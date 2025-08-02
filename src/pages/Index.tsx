import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Users, 
  BookOpen, 
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Star,
  TrendingUp,
  Globe,
  Award,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  job_type: string;
  experience_level: string;
  description: string;
  requirements: string[];
  benefits: string[];
  created_at: string;
}

const Index = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeJob = (jobId: string) => {
    const newLikedJobs = new Set(likedJobs);
    if (likedJobs.has(jobId)) {
      newLikedJobs.delete(jobId);
      toast({
        title: "Removed from favorites",
        description: "Job removed from your favorites.",
      });
    } else {
      newLikedJobs.add(jobId);
      toast({
        title: "Added to favorites",
        description: "Job added to your favorites.",
      });
    }
    setLikedJobs(newLikedJobs);
  };

  const handleShareJob = (job: Job) => {
    const shareText = `Check out this job opportunity: ${job.title} at ${job.company}`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      email: `mailto:?subject=${encodeURIComponent(job.title)}&body=${encodeURIComponent(shareText)}`,
      instagram: `https://www.instagram.com/`,
    };

    // Create a simple share menu
    const shareMenu = document.createElement('div');
    shareMenu.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    shareMenu.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h3 class="text-lg font-semibold mb-4">Share Job</h3>
        <div class="space-y-2">
          <a href="${urls.whatsapp}" target="_blank" class="block w-full p-2 text-left hover:bg-gray-100 rounded">WhatsApp</a>
          <a href="${urls.email}" class="block w-full p-2 text-left hover:bg-gray-100 rounded">Email</a>
          <a href="${urls.instagram}" target="_blank" class="block w-full p-2 text-left hover:bg-gray-100 rounded">Instagram</a>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="block w-full p-2 text-left hover:bg-gray-100 rounded text-red-500">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(shareMenu);
  };

  const getJobTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">YouthConnect</h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => navigate("/jobs")}>Find Jobs</Button>
              <Button variant="ghost" onClick={() => navigate("/career-guidance")}>Career Guidance</Button>
              <Button variant="ghost" onClick={() => navigate("/job-map")}>Job Map</Button>
              <Button variant="ghost" onClick={() => navigate("/chatbot")}>AI Assistant</Button>
              <Button onClick={() => navigate("/auth")}>Login</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-bg text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-float">
              Find Your Dream Job in India
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Connecting youth across India with local opportunities, career guidance, and real-time job alerts
            </p>
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies, locations..."
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/70 glass"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                size="lg" 
                className="h-12 px-8 bg-white text-primary hover:bg-white/90 animate-pulse-glow"
                onClick={() => navigate("/jobs")}
              >
                Search Jobs
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm opacity-80">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm opacity-80">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm opacity-80">Job Seekers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm opacity-80">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose YouthConnect?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers comprehensive job search tools designed specifically for Indian youth
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-card border-0">
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Local Job Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Find jobs in your city with our location-based search and interactive job map.</p>
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate("/jobs")}>
                  Explore Jobs
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-card border-0">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Career Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Get expert advice on career paths, skill development, and industry insights.</p>
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate("/career-guidance")}>
                  Get Guidance
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-card border-0">
              <CardHeader>
                <MessageCircle className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chat with our AI assistant for personalized job recommendations and career advice.</p>
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate("/chatbot")}>
                  Chat Now
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-card border-0">
              <CardHeader>
                <Globe className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multi-Language Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Access the platform in your preferred language for better understanding.</p>
                <Button variant="outline" className="mt-4 w-full">
                  Switch Language
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-card border-0">
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Resume Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Create professional resumes with our easy-to-use resume builder and templates.</p>
                <Button variant="outline" className="mt-4 w-full">
                  Build Resume
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-card border-0">
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-time Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Get instant notifications for new jobs matching your preferences and skills.</p>
                <Button variant="outline" className="mt-4 w-full">
                  Set Alerts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Job Opportunities</h2>
              <p className="text-muted-foreground">Fresh opportunities updated daily</p>
            </div>
            <Button onClick={() => navigate("/jobs")} className="flex items-center gap-2">
              View All Jobs
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-all duration-300 group bg-gradient-card border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {job.title}
                        </CardTitle>
                        <p className="text-muted-foreground font-medium">{job.company}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeJob(job.id)}
                        className="p-2"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            likedJobs.has(job.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`} 
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getJobTypeColor(job.job_type)}>
                          {job.job_type}
                        </Badge>
                        <Badge variant="outline">{job.experience_level}</Badge>
                        {job.salary_range && (
                          <Badge variant="secondary">{job.salary_range}</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/job/${job.id}`)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShareJob(job)}
                            className="p-2"
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/apply/${job.id}`)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">YouthConnect Impact</h2>
            <p className="text-xl opacity-90">Empowering India's youth with opportunities</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="opacity-80">States Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="opacity-80">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="opacity-80">Industries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="opacity-80">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold">YouthConnect</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Empowering India's youth with job opportunities and career guidance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="h-auto p-0 justify-start" onClick={() => navigate("/jobs")}>
                  Find Jobs
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start" onClick={() => navigate("/career-guidance")}>
                  Career Guidance
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start" onClick={() => navigate("/job-map")}>
                  Job Map
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="h-auto p-0 justify-start" onClick={() => navigate("/chatbot")}>
                  AI Assistant
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start">
                  Help Center
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start">
                  Contact Us
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="h-auto p-0 justify-start">
                  Privacy Policy
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start">
                  Terms of Service
                </Button>
                <Button variant="ghost" className="h-auto p-0 justify-start">
                  About Us
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 YouthConnect. All rights reserved. Made with ❤️ for India's youth.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;