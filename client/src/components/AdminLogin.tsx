import { useState } from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  error?: string;
}

export function AdminLogin({ onLogin, error }: AdminLoginProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-400 mt-2">Enter your admin password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-6">
          Colorado Spartans Ticket Admin
        </p>
      </div>
    </div>
  );
}
