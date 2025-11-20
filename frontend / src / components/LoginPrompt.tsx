import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Shield, TrendingUp, Coins } from 'lucide-react';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12 space-y-4">
        <img
          src="/assets/generated/wind-dashboard-hero.dim_1200x600.png"
          alt="Wind Dashboard"
          className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl border border-border/50"
        />
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Welcome to Wind
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track SOL and BTC prices in real-time and earn automatic rewards when market conditions are met
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="border-accent/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <TrendingUp className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Live Price Tracking</CardTitle>
            <CardDescription>
              Monitor SOL and BTC prices with real-time updates from trusted oracle APIs
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <Coins className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Automatic Rewards</CardTitle>
            <CardDescription>
              Earn 0.5 SOL tokens when SOL increases 30% or BTC increases 10%
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <Shield className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Secure Authentication</CardTitle>
            <CardDescription>
              Login securely with Internet Identity - no passwords, no tracking
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="max-w-md mx-auto border-primary/20 bg-card/80 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Get Started</CardTitle>
          <CardDescription>
            Connect with Internet Identity to access the dashboard and start tracking prices
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="lg"
            className="gap-2 px-8"
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login with Internet Identity
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
