import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react';

import logoFocom from '@/assets/logo-focom.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminPath } from '@/lib/adminPath';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(adminPath(), { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.ok) {
        navigate(adminPath(), { replace: true });
      } else if (result.reason === 'no_admin_role') {
        setError("Ce compte n'a pas accès à l’administration.");
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1525] p-4 sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-red-600/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-0 h-[30rem] w-[30rem] rounded-full bg-teal-500/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[12%] top-[-8rem] h-96 w-96 rounded-full border-[70px] border-white/[0.025]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_40px_120px_-35px_rgba(0,0,0,0.8)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#13233A] via-[#122238] to-[#0a1423] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-xl backdrop-blur">
                <img src={logoFocom} alt="Logo FO COM" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="text-base font-extrabold tracking-tight">FOCOM UES ILIAD</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Administration</p>
              </div>
            </div>

            <div className="mt-16">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">Console sécurisée</p>
              <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-tight tracking-tight">
                Pilotez le site FO COM depuis un espace unique.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
                Gérez les contenus, les adhérents, les échanges, les documents et les campagnes du site.
              </p>
            </div>
          </div>

          <div className="relative mt-12 space-y-3">
            {[
              'Accès réservé aux rôles autorisés',
              'Données synchronisées avec Supabase',
              'Journal des actions et permissions centralisées',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/75 backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 shrink-0 text-teal-300" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-9 lg:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#13233A]">
              <img src={logoFocom} alt="Logo FO COM" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">FOCOM UES ILIAD</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">Administration</p>
            </div>
          </div>

          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">Connexion administrateur</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Identifiez-vous pour accéder à la console de gestion.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-bold text-slate-700">Nom d’utilisateur</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Votre nom d’utilisateur"
                  className="h-11 rounded-xl pl-10"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold text-slate-700">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Votre mot de passe"
                  className="h-11 rounded-xl pl-10 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="h-11 w-full rounded-xl bg-red-600 font-bold text-white shadow-lg shadow-red-950/15 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                'Se connecter'
              )}
            </Button>

            <Link to="/" className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Retour au site
            </Link>
          </form>

          <p className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
            Accès réservé aux administrateurs autorisés.
          </p>
        </section>
      </div>
    </main>
  );
}
