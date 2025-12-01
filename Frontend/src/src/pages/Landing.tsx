import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Shield, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Leaf,
  Coins,
  Users,
  FileCheck
} from "lucide-react";
import { Link } from "react-router-dom";

export const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: "Transparent & Secure",
      description: "Smart contracts ensure tamper-proof subsidy disbursement with complete audit trails."
    },
    {
      icon: Clock,
      title: "Automated Processing",
      description: "Milestone-based automatic payments eliminate manual processing delays."
    },
    {
      icon: TrendingUp,
      title: "Real-time Tracking",
      description: "Monitor production targets and subsidy status in real-time dashboards."
    },
    {
      icon: FileCheck,
      title: "Verified Milestones",
      description: "Independent auditor verification ensures genuine production claims."
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Create Subsidy Scheme",
      description: "Government sets production targets and subsidy amounts",
      icon: Leaf
    },
    {
      step: "2", 
      title: "Producer Registration",
      description: "H₂ producers register and connect their wallets",
      icon: Users
    },
    {
      step: "3",
      title: "Milestone Verification", 
      description: "Submit production data for auditor verification",
      icon: FileCheck
    },
    {
      step: "4",
      title: "Automatic Disbursement",
      description: "Smart contracts release subsidies upon milestone completion",
      icon: Coins
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H₂</span>
            </div>
            <span className="font-semibold text-xl">Subsidy Chain</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-warning text-warning">
              Testnet: Sepolia
            </Badge>
            <Link to="/login">
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Zap className="w-3 h-3 mr-1" />
            Blockchain-Powered Subsidy Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Transparent Green Hydrogen Subsidy Disbursement
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automate milestone-based subsidy payments through smart contracts. 
            Eliminate fraud, reduce delays, and ensure transparent green energy funding.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                <ArrowRight className="w-4 h-4 mr-2" />
                Open Dashboard
              </Button>
            </Link>
            {/* View Documentation removed for hackathon MVP */}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="px-6 py-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">The Problem</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  Manual subsidy processing causes 3-6 month delays
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  Lack of transparency leads to fraud and disputes
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  Complex verification processes slow green energy adoption
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Solution</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <CheckCircle className="text-success mt-1 w-4 h-4" />
                  Smart contracts automate subsidy disbursement
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="text-success mt-1 w-4 h-4" />
                  Immutable blockchain records ensure transparency
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="text-success mt-1 w-4 h-4" />
                  Milestone-based verification accelerates payments
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to transform green hydrogen subsidy management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative overflow-hidden group hover:shadow-elevated transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {step.step}
                      </div>
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground">
              Built for government agencies, producers, auditors, and financial institutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-elevated transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Green Energy Funding?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of transparent, automated subsidy disbursement. Start exploring the platform.
          </p>
          
          <Link to="/login">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <ArrowRight className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar border-t border-sidebar-border px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-sidebar-foreground/70">
          <p>Built for college project • Ethereum Sepolia Testnet</p>
        </div>
      </footer>
    </div>
  );
};