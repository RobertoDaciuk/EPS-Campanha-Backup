/**
 * ============================================================================
 * LOGIN PAGE (REFATORADO - Princípio 1)
 * ============================================================================
 *
 * REFATORAÇÃO (Q.I. 170):
 * - CORRIGIDO: `handleSubmit` agora chama `login()` do `useAuth()` (Princípio 1).
 * - REMOVIDO: Manipulação manual do `localStorage` (responsabilidade do Provedor).
 * - REMOVIDO: Redirecionamento via `window.location.href` (anti-padrão).
 * - ATUALIZADO: Importação do `useAuth` de `ContextoAutenticacao` (Princípio 2).
 *
 * @module LoginPage
 * ============================================================================
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/ContextoAutenticacao"; // Corrigido (Princípio 2)
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  // ========================================
  // HOOKS E CONTEXTO
  // ========================================

  const { login } = useAuth(); // Corrigido: `login` será usado

  // ========================================
  // ESTADOS DO FORMULÁRIO
  // ========================================

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // VALIDAÇÃO DO FORMULÁRIO
  // ========================================

  const validateForm = (): boolean => {
    // Validação de Email
    if (!email.trim()) {
      toast.error("Por favor, informe seu email");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Por favor, informe um email válido");
      return false;
    }

    // Validação de Senha
    if (!password) {
      toast.error("Por favor, informe sua senha");
      return false;
    }

    // Nota: A validação de < 8 caracteres estava no frontend
    // mas o DTO (registrar-usuario.dto.ts) exige 8.
    // O login.dto.ts não exige mínimo. Vamos manter a validação
    // do frontend por consistência.
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return false;
    }

    return true;
  };

  // ========================================
  // HANDLER: SUBMIT (LÓGICA CORRIGIDA - Princípio 1)
  // ========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // ========================================
      // 1. CHAMADA À API DE LOGIN
      // ========================================

      const response = await api.post("/autenticacao/login", {
        email: email.trim(),
        senha: password, // O DTO usa 'senha'
      });

      console.log("📡 Resposta completa da API:", response.data);

      // ========================================
      // 2. VALIDAR RESPOSTA
      // ========================================

      if (!response.data) {
        throw new Error("Resposta vazia do servidor");
      }

      const { token, usuario } = response.data;

      if (!token) {
        throw new Error("Token não recebido do servidor");
      }

      if (!usuario || !usuario.nome) {
        throw new Error("Dados do usuário inválidos ou incompletos");
      }

      // ========================================
      // 3. FEEDBACK DE SUCESSO
      // ========================================

      toast.success(`Bem-vindo, ${usuario.nome}!`);

      // ========================================
      // 4. CHAMAR O CONTEXTO (FLUXO CORRETO)
      // ========================================
      //
      // A função `login` do ProvedorAutenticacao é agora
      // a fonte única da verdade para atualizar o estado,
      // persistir dados e redirecionar.
      //
      login(token, usuario, rememberMe);

      // [REMOVIDO] Armazenamento manual no localStorage
      // [REMOVIDO] Redirecionamento manual via window.location.href
    } catch (error: any) {
      // ========================================
      // TRATAMENTO DE ERROS
      // ========================================

      console.error("❌ Erro no login:", error);

      let errorMessage = "Erro ao realizar login. Tente novamente.";

      if (error.response?.data?.message) {
        // Mensagens do backend (Ex: "Credenciais inválidas.")
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Tratamento específico de status HTTP
      if (error.response?.status === 401) {
        // 401 (Unauthorized) - Mensagem genérica do backend
        errorMessage = error.response.data.message || "Email ou senha incorretos";
      } else if (error.response?.status === 429) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos.";
      } else if (!error.response) {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      }

      toast.error(errorMessage);
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // RENDER (Design Magnífico - Princípio 4)
  // ========================================

  return (
    <div className="relative w-full">
      {/* Toggle de Tema */}
      <motion.div
        className="absolute -top-16 right-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <ThemeToggle />
      </motion.div>

      {/* Card Principal (Glassmorphism) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/*
          NOTA: O 'glass' e 'shadow-glass-lg' não são padrões Tailwind.
          Assumindo que `globals.css` define:
          .glass { background: bg-card/70; backdrop-filter: blur(12px); }
          Vou manter `bg-card/70 backdrop-blur-lg` conforme Princípio 4.
        */}
        <div
          className="bg-card/70 backdrop-blur-lg rounded-3xl p-6 md:p-9 
                       shadow-xl shadow-black/10
                       border border-white/20
                       relative overflow-hidden"
        >
          {/* Orbe de Brilho Animado */}
          <motion.div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 
                       bg-primary/20 rounded-full blur-3xl pointer-events-none"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative z-10 space-y-6">
            {/* Logo e Título */}
            <div className="text-center space-y-3">
              <motion.div
                className="inline-flex items-center justify-center mb-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h1 className="text-3xl md:text-4xl font-bold whitespace-nowrap bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                  EPS Campanhas
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-1.5"
              >
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                  Bem-vindo de volta
                </h2>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Entre com suas credenciais para continuar
                </p>
              </motion.div>
            </div>

            {/* Formulário */}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {/* Campo Email */}
              <motion.div
                className="space-y-1.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-foreground"
                >
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all duration-300">
                    <Mail className="w-4 h-4" />
                  </div>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    autoComplete="email"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-border bg-background/50 
                             text-sm text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:border-primary focus:bg-background 
                             focus:shadow-lg focus:shadow-primary/10
                             transition-all duration-300
                             hover:border-primary/50 hover:bg-background/80
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </motion.div>

              {/* Campo Senha */}
              <motion.div
                className="space-y-1.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-foreground"
                >
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all duration-300">
                    <Lock className="w-4 h-4" />
                  </div>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border-2 border-border bg-background/50 
                             text-sm text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:border-primary focus:bg-background 
                             focus:shadow-lg focus:shadow-primary/10
                             transition-all duration-300
                             hover:border-primary/50 hover:bg-background/80
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-accent disabled:opacity-50"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Link "Esqueci minha senha" */}
                <div className="flex justify-end pt-0.5">
                  <Link
                    href="/recuperar-senha"
                    className="text-xs text-primary hover:underline transition-all inline-flex items-center gap-1 group"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Esqueci minha senha
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>

              {/* Lembrar-me */}
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-3.5 h-3.5 rounded border-2 border-border text-primary 
                           focus:ring-2 focus:ring-primary/20 focus:ring-offset-0
                           transition-all cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="remember"
                  className="ml-2.5 text-xs text-foreground/80 cursor-pointer select-none"
                >
                  Manter-me conectado
                </label>
              </motion.div>

              {/* Botão de Entrada */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-3 rounded-xl font-semibold text-sm
                         bg-primary text-primary-foreground 
                         shadow-lg shadow-primary/25
                         transition-all duration-300
                         hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]
                         active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar na plataforma</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Link de Cadastro */}
            <motion.div
              className="pt-4 border-t border-border/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className="text-center text-xs">
                <span className="text-muted-foreground whitespace-nowrap">
                  Ainda não tem uma conta?{" "}
                  <Link
                    href="/registro"
                    className="text-primary font-semibold hover:underline transition-all inline-flex items-center gap-1 group"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Cadastre-se aqui
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center mt-6 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        © 2025 EPS Campanhas. Todos os direitos reservados.
      </motion.div>
    </div>
  );
}