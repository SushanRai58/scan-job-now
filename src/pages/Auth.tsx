import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
      });
      setLoading(false);
      return;
    }

    if (!email.endsWith(".edu") && !email.includes("student")) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please use your college email address (.edu domain).",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Account created!",
        description: "You can now sign in with your credentials.",
      });
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "var(--gradient-primary)" }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">JobGuard AI</h1>
          <p className="text-muted-foreground">Secure Job Verification for Students</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Access</CardTitle>
            <CardDescription>Sign up or sign in with your college email</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">
                      <Mail className="inline w-4 h-4 mr-2" />
                      College Email
                    </Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      placeholder="your.name@college.edu"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">
                      <Lock className="inline w-4 h-4 mr-2" />
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      name="signin-password"
                      type="password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">
                      <Mail className="inline w-4 h-4 mr-2" />
                      College Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="your.name@college.edu"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Use your .edu email address</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">
                      <Lock className="inline w-4 h-4 mr-2" />
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      <Lock className="inline w-4 h-4 mr-2" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
