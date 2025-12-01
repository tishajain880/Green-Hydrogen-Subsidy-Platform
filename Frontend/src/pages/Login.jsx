import { useState } from 'react';
import { apiClient } from '../services/api.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '../components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // No client-side validation: send credentials directly to backend

    try {
      const response = await apiClient.login({ email, password });

      if (response && response.user) {
        localStorage.setItem('userSession', JSON.stringify(response.user));
      }

      toast({
        title: 'Login successful',
        description: `Welcome back, ${response.user?.name || ''}`
      });

      navigate('/dashboard');
    } catch (err) {
      const message = err?.message || 'Login failed. Please try again.';
      setError(message.includes('Invalid') ? 'Invalid email or password.' : message);

      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-4xl">

        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="hidden md:flex bg-gradient-to-b from-white/60 to-white/40 p-8 items-center justify-center">
            <div className="space-y-4 max-w-sm">
              <svg
                viewBox="0 0 120 120"
                className="w-full h-48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="g" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                <rect
                  x="0"
                  y="0"
                  width="120"
                  height="120"
                  rx="16"
                  fill="url(#g)"
                  opacity="0.12"
                />

                <g fill="#064e3b" opacity="0.9">
                  <circle cx="40" cy="40" r="6" />
                  <rect x="60" y="30" width="40" height="8" rx="3" />
                  <rect x="30" y="60" width="60" height="8" rx="3" />
                </g>
              </svg>

              <div>
                <h2 className="text-2xl font-bold">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to manage subsidy schemes, enrollments and milestones.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-6">

            <div className="px-2 pb-4">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">H₂</span>
                </div>
                <div className="text-lg font-semibold">H₂ Subsidy Chain</div>
              </Link>
            </div>

            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Login <br />Green H₂ Subsidy Platfrom
              </CardTitle>
              <CardDescription className="text-center">
                Access your account to manage subsidies
              </CardDescription>
            </CardHeader>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password@123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-9 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary underline">
                    Register
                  </Link>
                </p>
              </CardFooter>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
