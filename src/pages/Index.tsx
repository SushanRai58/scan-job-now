import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Search, CheckCircle2, AlertTriangle, FileText, Link2, Info, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [jobInput, setJobInput] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const analyzeJob = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to analyze job postings.",
      });
      navigate("/auth");
      return;
    }

    if (!jobInput.trim() && !jobUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please provide a job description or URL.",
      });
      return;
    }

    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-job', {
        body: {
          jobInput: jobInput.trim(),
          jobUrl: jobUrl.trim()
        }
      });

      if (error) throw error;

      if (data.success) {
        setResult(data.data);
        toast({
          title: "Analysis complete",
          description: `Job classified as ${data.data.classification}`,
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze job posting. Please try again.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">JobGuard AI</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Job Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/about")}>
              <Info className="w-4 h-4 mr-2" />
              About
            </Button>
            <Button variant="ghost" onClick={() => navigate("/contact")}>
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
            {user ? (
              <Button onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">
              Verify Job Postings
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Before You Apply
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Protect yourself from fake job scams. Get instant AI-powered analysis of any job posting.
            </p>
          </div>

          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Analyze Job Posting
              </CardTitle>
              <CardDescription>
                Paste the job description below or provide a URL to the posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Job Description
                </div>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Link2 className="w-4 h-4" />
                  Job Posting URL
                </div>
                <Input
                  type="url"
                  placeholder="https://example.com/job-posting"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
              </div>

              <Button
                onClick={analyzeJob}
                disabled={analyzing || (!jobInput.trim() && !jobUrl.trim())}
                className="w-full"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze Job Posting
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className={`shadow-lg ${result.classification === "legitimate" ? "border-success" : "border-warning"}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {result.classification === "legitimate" ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-success" />
                        <span className="text-success">Legitimate Job</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-6 h-6 text-warning" />
                        <span className="text-warning">Suspicious Job</span>
                      </>
                    )}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Confidence</div>
                    <div className="text-2xl font-bold">{result.confidence}%</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Analysis Summary</h4>
                  <p className="text-muted-foreground">{result.explanation}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Detected Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword: string, idx: number) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-sm ${
                          result.classification === "legitimate"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {result.classification !== "legitimate" && (
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <h4 className="font-semibold text-warning mb-2">⚠️ Warning</h4>
                    <p className="text-sm text-muted-foreground">
                      This job posting shows signs of being fraudulent. Be cautious and verify the company independently before proceeding.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
