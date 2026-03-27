import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'lux-auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = event => {
    event.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    window.localStorage.setItem(STORAGE_KEY, 'true');
    window.localStorage.setItem('lux-user', name.trim());
    const nextPath = location.state?.from || '/dashboard';
    navigate(nextPath, { replace: true });
  };

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-800 bg-dark-bg bg-opacity-80 p-10 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Secure Access</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">AI Assistant Login</h2>
        <p className="mt-3 text-sm text-gray-400">
          Masuk untuk melihat ringkasan investasi dan asisten AI yang terhubung ke data pasar terbaru.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-[0.28em] text-gray-400">Nama</label>
            <input
              className="mt-2 w-full rounded-lg border border-gray-800 bg-black bg-opacity-40 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Masukkan nama kamu"
              autoComplete="name"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full border border-gold bg-gold px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-gray-900 transition hover:bg-transparent hover:text-gold disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-gray-800 bg-black bg-opacity-40 p-4">
          <p className="text-xs text-gray-500">
            Akses ini simulasi menggunakan localStorage, bukan autentikasi nyata.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
