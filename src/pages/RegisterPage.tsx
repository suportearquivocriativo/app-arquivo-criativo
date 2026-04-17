import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { motion } from 'motion/react';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso.');
      } else {
        setError('Ocorreu um erro ao criar a conta.');
      }
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
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Cadastro</h1>
        <p className="text-text-muted text-center mb-8">Crie sua conta gratuitamente</p>

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

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">Confirmar Senha</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full bg-black border border-border rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-colors"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 uppercase font-bold">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-text-muted text-center mt-8 text-sm">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-accent hover:underline">Faça login</Link>
        </p>
      </motion.div>
    </div>
  );
}
