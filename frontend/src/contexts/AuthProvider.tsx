"use client";

/**
 * ============================================================================
 * AUTH PROVIDER - Provedor de Contexto de Autenticação (REFATORADO)
 * ============================================================================
 *
 * REFATORAÇÃO (Sprint 18.3 - Correção de Login):
 * - SIMPLIFICADO: Método login() agora apenas armazena dados localmente
 * - CORRIGIDO: Não busca usuário novamente após login (dados já vêm da API)
 * - MELHORADO: Validação inicial usa localStorage em vez de API
 * - RESULTADO: Login rápido e sem erros de "nome undefined"
 *
 * Descrição:
 * Provedor de autenticação que gerencia todo o estado de autenticação
 * da aplicação, incluindo token JWT, dados do usuário, persistência
 * no localStorage e redirecionamentos.
 *
 * Responsabilidades:
 * - Armazenar token JWT e dados do usuário
 * - Persistir token e usuário no localStorage
 * - Validar token automaticamente ao carregar aplicação
 * - Injetar token no header Authorization via Axios
 * - Redirecionar para login se não autenticado
 * - Redirecionar para dashboard após login
 * - Fornecer funções login() e logout() para componentes
 *
 * @module AuthProvider
 * ============================================================================
 */

import { ReactNode, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext, Usuario } from "./AuthContext";
import api from "@/lib/axios";

/**
 * Props do AuthProvider.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Chaves para armazenar dados no localStorage.
 */
const TOKEN_KEY = "@EPSCampanhas:token";
const USUARIO_KEY = "@EPSCampanhas:usuario";

/**
 * Rotas públicas que não requerem autenticação.
 */
const PUBLIC_ROUTES = ["/login", "/registro", "/recuperar-senha"];

/**
 * Provedor de Autenticação.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // ========================================
  // ESTADOS
  // ========================================

  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // ========================================
  // FUNÇÕES DE AUTENTICAÇÃO
  // ========================================

  /**
   * Função de login.
   * 
   * SIMPLIFICADO: Apenas armazena dados localmente e redireciona.
   * Não faz requisição à API (dados já foram validados no page.tsx).
   * 
   * @param novoToken - Token JWT retornado pelo backend
   * @param dadosUsuario - Dados do usuário retornados pelo backend
   */
  const login = useCallback(
    (novoToken: string, dadosUsuario: Usuario) => {
      // Armazenar no localStorage
      localStorage.setItem(TOKEN_KEY, novoToken);
      localStorage.setItem(USUARIO_KEY, JSON.stringify(dadosUsuario));

      // Atualizar estados
      setToken(novoToken);
      setUsuario(dadosUsuario);

      // Injetar token no header do Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${novoToken}`;

      // Redirecionar para dashboard
      router.push("/dashboard");
    },
    [router]
  );

  /**
   * Função de logout.
   */
  const logout = useCallback(() => {
    // Remover do localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);

    // Limpar estados
    setToken(null);
    setUsuario(null);

    // Remover token do header do Axios
    delete api.defaults.headers.common["Authorization"];

    // Redirecionar para login
    router.push("/login");
  }, [router]);

  // ========================================
  // CARREGAMENTO INICIAL
  // ========================================

  /**
   * Carrega autenticação do localStorage ao montar.
   * 
   * SIMPLIFICADO: Não faz requisição à API na inicialização.
   * Confia nos dados armazenados localmente.
   */
  useEffect(() => {
    const carregarAuth = () => {
      try {
        const tokenArmazenado = localStorage.getItem(TOKEN_KEY);
        const usuarioArmazenado = localStorage.getItem(USUARIO_KEY);

        if (tokenArmazenado && usuarioArmazenado) {
          const dadosUsuario = JSON.parse(usuarioArmazenado);

          // Atualizar estados
          setToken(tokenArmazenado);
          setUsuario(dadosUsuario);

          // Injetar token no header do Axios
          api.defaults.headers.common["Authorization"] = `Bearer ${tokenArmazenado}`;
        }
      } catch (erro) {
        console.error("[AuthProvider] Erro ao carregar autenticação:", erro);
        
        // Limpar localStorage em caso de erro
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USUARIO_KEY);
      } finally {
        setCarregando(false);
      }
    };

    carregarAuth();
  }, []);

  // ========================================
  // PROTEÇÃO DE ROTAS
  // ========================================

  /**
   * Redireciona usuário para login se não autenticado.
   */
  useEffect(() => {
    // Se ainda carregando, aguardar
    if (carregando) {
      return;
    }

    const rotaPublica = PUBLIC_ROUTES.includes(pathname);

    // Se não autenticado e rota não é pública, redirecionar para login
    if (!token && !rotaPublica) {
      router.push("/login");
      return;
    }

    // Se autenticado e está na rota de login, redirecionar para dashboard
    if (token && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [pathname, carregando, token, router]);

  // ========================================
  // RENDER
  // ========================================

  /**
   * Loading state durante inicialização.
   */
  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  /**
   * Fornece contexto de autenticação para toda a aplicação.
   */
  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        estaAutenticado: !!token,
        carregando,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
