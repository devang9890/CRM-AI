import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await refetch();
        toast.success('Signed in successfully!');
        navigate('/dashboard', { replace: true });
      } catch {
        setError('Authentication failed. Please try again.');
        toast.error('Login failed');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };
    handleCallback();
  }, [navigate, refetch]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm text-text-secondary">{error}</p>
          <p className="text-xs text-text-muted">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-text-muted">Signing you in...</p>
      </div>
    </div>
  );
}
