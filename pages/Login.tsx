import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Info } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegisterInfo, setShowRegisterInfo] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <GraduationCap className="text-white h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">SIGEP</h1>
          <p className="text-blue-100 text-sm">UEMA Profitec</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Institucional</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="secretaria@uema.br"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-900/50"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2">
            <button 
                type="button"
                onClick={() => setShowRegisterInfo(!showRegisterInfo)}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition text-center"
            >
                Primeiro acesso ou Esqueci minha senha
            </button>

            {showRegisterInfo && (
                <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 flex items-start gap-3 mt-2 animate-in fade-in slide-in-from-top-2">
                    <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-blue-200">
                        Contate o administrador para cadastrar ou redefinir um usuário!
                    </p>
                </div>
            )}
          </div>

          <div className="mt-8 text-center text-xs text-slate-500">
            &copy; 2025 UEMA Profitec. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </div>
  );
};