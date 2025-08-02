import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  MapPin, 
  Briefcase, 
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Gift,
  Heart,
  Share2,
  Building
} from "lucide-react";

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
  application_deadline: string;
  created_at: string;
}

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
    }
  }, [id]);

  const fetchJobDetails = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast({
        title: "Error",
        description: "Failed to load job details. Please try again.",
        variant: "destructive",
      });
      navigate("/jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeJob = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Job removed from your favorites." : "Job added to your favorites.",
    });
  };

  const handleShareJob = () => {
    if (!job) return;
    
    const shareText = `Check out this job opportunity: ${job.title} at ${job.company}`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      email: `mailto:?subject=${encodeURIComponent(job.title)}&body=${encodeURIComponent(shareText)}`,
      instagram: `https://www.instagram.com/`,
    };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-card/95 backdrop-blur sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/jobs")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Jobs
              </Button>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <Button onClick={() => navigate("/jobs")}>Browse All Jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/jobs")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Jobs
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleLikeJob} className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {isLiked ? 'Saved' : 'Save Job'}
              </Button>
              <Button variant="outline" onClick={handleShareJob} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button onClick={() => navigate(`/apply/${job.id}`)}>
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {formatDate(job.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getJobTypeColor(job.job_type)}>
                        {job.job_type}
                      </Badge>
                      <Badge variant="outline">{job.experience_level}</Badge>
                      {job.salary_range && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary_range}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Benefits & Perks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Gift className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Apply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate(`/apply/${job.id}`)}
                >
                  Apply for this Job
                </Button>
                <Separator />
                <div className="space-y-2 text-sm">
                  {job.application_deadline && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-medium">{formatDate(job.application_deadline)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Job Type:</span>
                    <span className="font-medium capitalize">{job.job_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="font-medium capitalize">{job.experience_level}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  About {job.company}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {job.company} is hiring for the position of {job.title}. Join their team and be part of their mission.
                </p>
                <Button variant="outline" className="w-full">
                  View Company Profile
                </Button>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium text-sm">Frontend Developer</h4>
                    <p className="text-xs text-muted-foreground">Tech Corp • Bangalore</p>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium text-sm">React Developer</h4>
                    <p className="text-xs text-muted-foreground">StartupXYZ • Mumbai</p>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <h4 className="font-medium text-sm">UI Developer</h4>
                    <p className="text-xs text-muted-foreground">WebSolutions • Delhi</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View More Similar Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;