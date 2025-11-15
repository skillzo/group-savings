import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/user';
import { Button } from '../components/ui/Button';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    accountNumber: '',
    accountName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = (await api.createUser({
        email: formData.email,
        name: formData.name,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName || undefined,
        phone: formData.phone || undefined,
      })) as User;
      setUser(user);
      navigate('/');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to register. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="border rounded-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              Register
            </h1>
            <p className="text-sm text-muted-foreground">
              Create an account to get started
            </p>
          </div>

          {error && (
            <div className="mb-4 border border-destructive rounded-lg p-3 bg-destructive/10">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
              >
                Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="accountNumber"
                className="block text-sm font-medium mb-2"
              >
                Account Number *
              </label>
              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0456789123"
              />
            </div>

            <div>
              <label
                htmlFor="accountName"
                className="block text-sm font-medium mb-2"
              >
                Account Name
              </label>
              <input
                id="accountName"
                name="accountName"
                type="text"
                value={formData.accountName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="First Bank"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium mb-2"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="+2349012345678"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-foreground hover:underline font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

