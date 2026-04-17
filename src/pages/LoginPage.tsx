import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { motion } from 'motion/react';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const isConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (data: FormData) => {
    if (!isConfigured) {
      setError('Firebase não configurado. Adicione as chaves VITE_FIREBASE_* nos segredos (Secrets) do AI Studio.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('Email ou senha incorretos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] border border-border p-8 rounded-2xl shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Login</h1>
        <p className="text-text-muted text-center mb-8">Entre para acessar o editor</p>

        {!isConfigured && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 px-4 py-3 rounded-lg text-xs mb-6 text-center">
            <strong>Atenção:</strong> O Firebase não foi configurado. 
            <br />Adicione as chaves no painel <strong>Settings &gt; Secrets</strong>.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full bg-black border border-border rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors"
              placeholder="seu@email.com"
            />
            {errors.email && <p className="text-red-500 text-[10px] mt-1 uppercase font-bold">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">Senha</label>
            <input
              {...register('password')}
              type="password"
              className="w-full bg-black border border-border rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-[10px] mt-1 uppercase font-bold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-text-muted text-center mt-8 text-sm">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="text-accent hover:underline">Cadastre-se</Link>
        </p>
      </motion.div>
    </div>
  );
}
