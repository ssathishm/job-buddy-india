import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobMap = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .limit(20);
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Job Map</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interactive Job Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Map Integration Coming Soon</p>
                <p className="text-muted-foreground">Interactive map showing job locations across India</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: any) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <p className="text-muted-foreground">{job.company}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 mb-4">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <Button onClick={() => navigate(`/job/${job.id}`)}>View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobMap;