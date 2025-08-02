import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter,
  Heart,
  Share2,
  Eye,
  ArrowLeft
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

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, locationFilter, jobTypeFilter, experienceFilter]);

  const fetchJobs = async () => {
    try {
      let query = supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (locationFilter) {
        query = query.ilike("location", `%${locationFilter}%`);
      }

      if (jobTypeFilter) {
        query = query.eq("job_type", jobTypeFilter);
      }

      if (experienceFilter) {
        query = query.eq("experience_level", experienceFilter);
      }

      const { data, error } = await query;

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

  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("");
    setJobTypeFilter("");
    setExperienceFilter("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Find Jobs</h1>
              </div>
            </div>
            <Button onClick={() => navigate("/auth")}>Login</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-card p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                className="pl-10"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {jobs.length} jobs found
              </span>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
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
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clearing filters
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
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

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Key Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
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
    </div>
  );
};

export default Jobs;