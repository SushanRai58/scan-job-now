import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Brain, Users, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Detection",
      description: "Advanced machine learning algorithms analyze job postings for fraudulent patterns and suspicious indicators."
    },
    {
      icon: Shield,
      title: "Student Protection",
      description: "Exclusively designed for students to verify job opportunities before applying, preventing scams and fraud."
    },
    {
      icon: Users,
      title: "Community Reporting",
      description: "Help improve detection accuracy by reporting suspicious postings you encounter."
    },
    {
      icon: AlertTriangle,
      title: "Real-time Analysis",
      description: "Instant verification results with confidence scores and detailed explanations for every analysis."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">JobGuard AI</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About JobGuard AI</h1>
            <p className="text-xl text-muted-foreground">
              Protecting students from fake job postings using artificial intelligence
            </p>
          </div>

          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                JobGuard AI was created to address the growing concern of fraudulent job postings targeting students and recent graduates. 
                In today's digital job market, scammers exploit the eagerness of students seeking employment opportunities, leading to 
                financial losses, identity theft, and wasted time.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our AI-powered system analyzes job descriptions, identifies suspicious patterns, and provides instant verification results 
                to help students make informed decisions before applying. By combining machine learning with community reporting, we're 
                building a safer job-seeking environment for the student community.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {features.map((feature, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Societal Impact</h2>
              <p className="mb-6 leading-relaxed">
                By preventing job scams, we help students avoid financial losses, protect their personal information, 
                and focus their energy on legitimate career opportunities. Our platform contributes to a safer, more 
                transparent job market for the next generation of professionals.
              </p>
              <Button variant="secondary" onClick={() => navigate("/")}>
                Start Analyzing Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;
