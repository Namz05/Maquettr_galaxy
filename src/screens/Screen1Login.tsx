import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconBuildingSkyscraper,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconArrowRight,
  IconShieldCheck
} from '@tabler/icons-react';

export const Screen1Login: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('admin@galaxyhotel.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      login(email);
      setLoading(false);
    }, 400);
  };

  const handleQuickDemoFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Galaxy2026!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5EAF1] shadow-xl p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4C97DB] to-[#58A2F7] text-white shadow-md shadow-[#4C97DB]/25 mb-4">
            <IconBuildingSkyscraper className="w-7 h-7" stroke={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-[#263445] tracking-tight">
            GALAXY HÔTEL
          </h1>
          <p className="text-sm text-[#718096] mt-1">
            Plateforme de gestion hôtelière centralisée
          </p>
        </div>

        {/* Welcome Text */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-[#263445]">Bienvenue sur votre espace</h2>
          <p className="text-xs text-[#718096] mt-0.5">
            Connectez-vous pour accéder à la gestion des chambres, du restaurant, des finances et des stocks.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Email / Identifier */}
          <div>
            <label className="block text-xs font-semibold text-[#263445] mb-1.5">
              Identifiant ou adresse e-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718096]">
                <IconMail className="w-4 h-4" stroke={1.75} />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: admin@galaxyhotel.com"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/60 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#263445] mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718096]">
                <IconLock className="w-4 h-4" stroke={1.75} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/60 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#718096] hover:text-[#263445] transition-colors"
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <IconEyeOff className="w-4 h-4" stroke={1.75} /> : <IconEye className="w-4 h-4" stroke={1.75} />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#718096]">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-[#4C97DB] rounded border-[#E5EAF1] focus:ring-[#4C97DB]"
              />
              <span>Se souvenir de moi</span>
            </label>
            <span className="text-[#4C97DB] hover:underline cursor-pointer">
              Mot de passe oublié ?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#4C97DB] hover:bg-[#58A2F7] active:bg-[#4C97DB] text-white font-semibold rounded-xl shadow-md shadow-[#4C97DB]/25 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <span className="text-sm">Connexion en cours...</span>
            ) : (
              <>
                <span className="text-sm">Se connecter</span>
                <IconArrowRight className="w-4 h-4" stroke={1.75} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Pills */}
        <div className="mt-8 pt-6 border-t border-[#E5EAF1]">
          <p className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider mb-2.5 text-center">
            Accès rapide Démonstration
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoFill('admin@galaxyhotel.com')}
              className="p-2 text-center rounded-xl border border-[#E5EAF1] hover:border-[#4C97DB] hover:bg-[#F5F8FC] text-[#263445] transition-colors"
            >
              <span className="font-semibold block">Administrateur</span>
              <span className="text-[10px] text-[#718096]">Direction générale</span>
            </button>
            <button
              onClick={() => handleQuickDemoFill('reception@galaxyhotel.com')}
              className="p-2 text-center rounded-xl border border-[#E5EAF1] hover:border-[#4C97DB] hover:bg-[#F5F8FC] text-[#263445] transition-colors"
            >
              <span className="font-semibold block">Réceptionniste</span>
              <span className="text-[10px] text-[#718096]">Front Desk</span>
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#718096]">
          <IconShieldCheck className="w-3.5 h-3.5 text-emerald-600" stroke={1.75} />
          <span>Connexion sécurisée · Session chiffrée</span>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="mt-6 text-center text-xs text-[#718096]">
        &copy; 2026 Galaxy Hôtel · Tous droits réservés
      </footer>
    </div>
  );
};
