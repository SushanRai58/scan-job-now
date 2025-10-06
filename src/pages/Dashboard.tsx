import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, LogOut, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobAnalysis {
  id: string;
  company_name: string | null;
  position_title: string | null;
  classification: string;
  confidence_score: number;
  detected_keywords: string[] | null;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<JobAnalysis[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    legitimate: 0,
    suspicious: 0
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        await fetchAnalyses(session.user.id);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
        fetchAnalyses(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAnalyses = async (userId: string) => {
    const { data, error } = await supabase
      .from('job_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analyses:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your job analyses.",
      });
      return;
    }

    if (data) {
      setAnalyses(data);
      
      // Calculate stats
      const total = data.length;
      const legitimate = data.filter(a => a.classification === 'legitimate').length;
      const suspicious = data.filter(a => a.classification === 'suspicious' || a.classification === 'fake').length;
      
      setStats({ total, legitimate, suspicious });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">JobGuard AI</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">View your analyzed job postings</p>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Legitimate Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.legitimate}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Suspicious Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.suspicious}</div>
            </CardContent>
          </Card>
        </div>

        <Button onClick={() => navigate("/")} className="mb-6">
          <Search className="w-4 h-4 mr-2" />
          Analyze New Job
        </Button>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Analyses</h3>
          {analyses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No job analyses yet</p>
                <Button onClick={() => navigate("/")}>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Your First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            analyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {analysis.position_title || "Job Position"}
                      </CardTitle>
                      <CardDescription>
                        {analysis.company_name || "Company Name"}
                      </CardDescription>
                    </div>
                    {analysis.classification === "legitimate" ? (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Legitimate</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">Suspicious</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Confidence Score</span>
                        <span className="text-sm font-semibold">{analysis.confidence_score}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${analysis.confidence_score}%`,
                            background: analysis.classification === "legitimate" 
                              ? "var(--gradient-success)" 
                              : "var(--gradient-primary)"
                          }}
                        />
                      </div>
                    </div>
                    {analysis.detected_keywords && analysis.detected_keywords.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Key Indicators: </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {analysis.detected_keywords.map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs rounded-md bg-secondary">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
