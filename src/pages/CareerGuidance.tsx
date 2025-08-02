import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Briefcase, 
  ArrowLeft,
  BookOpen,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Users,
  Star,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CareerGuide {
  id: string;
  title: string;
  category: string;
  content: string;
  skills_required: string[];
  salary_info: string;
  growth_prospects: string;
  education_path: string;
  created_at: string;
}

const CareerGuidance = () => {
  const [careerGuides, setCareerGuides] = useState<CareerGuide[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<CareerGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = ["Technology", "Marketing", "Analytics", "Creative", "Finance", "Healthcare"];

  useEffect(() => {
    fetchCareerGuides();
  }, [searchQuery, selectedCategory]);

  const fetchCareerGuides = async () => {
    try {
      let query = supabase
        .from("career_guidance")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCareerGuides(data || []);
    } catch (error) {
      console.error("Error fetching career guides:", error);
      toast({
        title: "Error",
        description: "Failed to load career guidance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Marketing': 'bg-green-100 text-green-800',
      'Analytics': 'bg-purple-100 text-purple-800',
      'Creative': 'bg-pink-100 text-pink-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Healthcare': 'bg-red-100 text-red-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
  };

  if (selectedGuide) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-card/95 backdrop-blur sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setSelectedGuide(null)} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Guidance
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">{selectedGuide.title}</h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold mb-2">{selectedGuide.title}</CardTitle>
                      <Badge className={getCategoryColor(selectedGuide.category)}>
                        {selectedGuide.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-lg text-muted-foreground mb-6">{selectedGuide.content}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Required */}
              {selectedGuide.skills_required && selectedGuide.skills_required.length > 0 && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Skills Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuide.skills_required.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education Path */}
              {selectedGuide.education_path && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedGuide.education_path}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Salary Information */}
              {selectedGuide.salary_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Salary Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedGuide.salary_info}</p>
                  </CardContent>
                </Card>
              )}

              {/* Growth Prospects */}
              {selectedGuide.growth_prospects && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Growth Prospects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedGuide.growth_prospects}</p>
                  </CardContent>
                </Card>
              )}

              {/* Related Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Related Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/jobs")}
                  >
                    Find {selectedGuide.title} Jobs
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/chatbot")}>
                    <Users className="h-4 w-4 mr-2" />
                    Ask AI Assistant
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Download Guide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Save for Later
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
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
              <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Career Guidance</h1>
              </div>
            </div>
            <Button onClick={() => navigate("/auth")}>Login</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Shape Your Career Path</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover career opportunities, understand industry requirements, and plan your professional journey with expert guidance.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-card p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search career guides..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("")}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {careerGuides.length} career guide{careerGuides.length !== 1 ? 's' : ''} found
            </span>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Career Guides Grid */}
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
        ) : careerGuides.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No career guides found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clearing filters
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerGuides.map((guide) => (
              <Card 
                key={guide.id} 
                className="hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-card border-0"
                onClick={() => setSelectedGuide(guide)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className={getCategoryColor(guide.category)} variant="secondary">
                        {guide.category}
                      </Badge>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors mt-2 mb-2">
                        {guide.title}
                      </CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {guide.content}
                  </p>
                  
                  {guide.skills_required && guide.skills_required.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {guide.skills_required.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {guide.skills_required.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{guide.skills_required.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {guide.salary_info && (
                    <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                        <DollarSign className="h-3 w-3" />
                        Salary Range
                      </div>
                      <p className="text-xs">{guide.salary_info}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Career Assessment CTA */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Not Sure Which Career Path to Choose?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Take our AI-powered career assessment to discover careers that match your interests, skills, and personality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/chatbot")} className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Talk to AI Career Counselor
              </Button>
              <Button variant="outline">
                Take Career Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareerGuidance;