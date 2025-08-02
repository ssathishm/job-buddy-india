import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Upload,
  FileText,
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  experience_level: string;
}

const JobApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    coverLetter: "",
    experience: "",
    skills: "",
    resume: null as File | null,
  });

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
    }
  }, [id]);

  const fetchJobDetails = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company, location, job_type, experience_level")
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        resume: file
      }));
    }
  };

  const uploadResume = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job) return;

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.resume) {
      toast({
        title: "Resume required",
        description: "Please upload your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, we'll create a mock user ID since authentication isn't implemented
      const mockUserId = `user_${Date.now()}`;
      
      let resumeUrl = "";
      if (formData.resume) {
        resumeUrl = await uploadResume(formData.resume, mockUserId);
      }

      const { error } = await supabase
        .from("job_applications")
        .insert({
          user_id: mockUserId,
          job_id: job.id,
          cover_letter: formData.coverLetter,
          resume_url: resumeUrl,
        });

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "Your application has been submitted successfully. We'll be in touch soon!",
      });

      // Redirect to jobs page after successful submission
      setTimeout(() => {
        navigate("/jobs");
      }, 2000);

    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(`/job/${job.id}`)} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Job Details
            </Button>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Apply for Job</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Job Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Applying for
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{job.title}</h3>
              <p className="text-muted-foreground">{job.company}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <span>•</span>
                <span className="capitalize">{job.job_type}</span>
                <span>•</span>
                <span className="capitalize">{job.experience_level} level</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Personal Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Current Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="Enter your current location"
                        className="pl-10"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Professional Information</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Work Experience</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    placeholder="Briefly describe your relevant work experience..."
                    rows={3}
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Key Skills</Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    placeholder="List your key skills relevant to this position..."
                    rows={2}
                    value={formData.skills}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  placeholder="Write a brief cover letter explaining why you're interested in this position..."
                  rows={4}
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                />
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label htmlFor="resume">Resume *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="resume" className="cursor-pointer">
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.resume ? formData.resume.name : "Click to upload your resume"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, or DOCX (max 5MB)
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                {formData.resume && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    <span>Resume uploaded successfully</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Application"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  By submitting this application, you agree to our terms and conditions.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobApplication;