/**
 * ============================================================================
 * PROVEDOR DE AUTENTICAÇÃO (Corrigido)
 * ============================================================================
 *
 * REFATORAÇÃO (Q.I. 170):
 * - CORRIGIDO: `router.push("/dashboard")` alterado para `router.push("/")`.
 * - MOTIVO: A estrutura de arquivos `(dashboard)/page.tsx` indica um
 * Grupo de Rota do Next.js, que serve a página na raiz (`/`),
 * não em `/dashboard`.
 *
 * @module ProvedorAutenticacao
 * ============================================================================
 */
"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ContextoAutenticacao, Usuario } from "./ContextoAutenticacao";
import api from "@/lib/axios";

/**
 * Props do ProvedorAutenticacao.
 */
interface ProvedorAutenticacaoProps {
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
const ROTAS_PUBLICAS = ["/login", "/registro", "/recuperar-senha"];

/**
 * Provedor de Autenticação (Refatorado).
 */
export function ProvedorAutenticacao({ children }: ProvedorAutenticacaoProps) {
  const router = useRouter();
  const pathname = usePathname();

  // ========================================
  // ESTADOS
  // ========================================

  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // ========================================
  // FUNÇÕES DE AUTENTICAÇÃO (LÓGICA CORRIGIDA)
  // ========================================

  /**
   * Função de login (CORRIGIDA).
   *
   * @param novoToken - Token JWT retornado pelo backend
   * @param dadosUsuario - Dados do usuário retornados pelo backend
   * @param lembrar - Flag "Lembrar-me" vinda da página de login
   */
  const login = useCallback(
    (novoToken: string, dadosUsuario: Usuario, lembrar: boolean) => {
      localStorage.setItem(TOKEN_KEY, novoToken);
      localStorage.setItem(USUARIO_KEY, JSON.stringify(dadosUsuario));

      // Atualizar estados
      setToken(novoToken);
      setUsuario(dadosUsuario);

      // Injetar token no header do Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${novoToken}`;

      // CORRIGIDO: Redirecionar para a rota raiz "/"
      // O (dashboard)/page.tsx é servido em "/"
      router.push("/");
    },
    [router],
  );

  /**
   * Função de logout.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);

    setToken(null);
    setUsuario(null);

    delete api.defaults.headers.common["Authorization"];

    router.push("/login");
  }, [router]);

  // ========================================
  // CARREGAMENTO INICIAL
  // ========================================

  useEffect(() => {
    const carregarAuth = () => {
      try {
        const tokenArmazenado = localStorage.getItem(TOKEN_KEY);
        const usuarioArmazenado = localStorage.getItem(USUARIO_KEY);

        if (tokenArmazenado && usuarioArmazenado) {
          const dadosUsuario = JSON.parse(usuarioArmazenado);
          setToken(tokenArmazenado);
          setUsuario(dadosUsuario);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${tokenArmazenado}`;
        }
      } catch (erro) {
        console.error(
          "[ProvedorAutenticacao] Erro ao carregar autenticação:",
          erro,
        );
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

  useEffect(() => {
    if (carregando) {
      return;
    }

    const rotaPublica = ROTAS_PUBLICAS.includes(pathname);

    // Se não autenticado e rota não é pública, redirecionar para login
    if (!token && !rotaPublica) {
      router.push("/login");
      return;
    }

    // Se autenticado e está na rota de login, redirecionar para a raiz
    if (token && pathname === "/login") {
      // CORRIGIDO: Redirecionar para a rota raiz "/"
      router.push("/");
    }
  }, [pathname, carregando, token, router]);

  // ========================================
  // RENDER
  // ========================================

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
    <ContextoAutenticacao.Provider
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
    </ContextoAutenticacao.Provider>
  );
}