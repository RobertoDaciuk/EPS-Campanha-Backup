"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext, Usuario } from "./AuthContext";
import api from "@/lib/axios";
import toast from "react-hot-toast";

/**
 * Props do AuthProvider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Chave para armazenar o token no localStorage
 */
const TOKEN_KEY = "@EPSCampanhas:token";

/**
 * Rotas públicas que não requerem autenticação
 */
const PUBLIC_ROUTES = ["/login", "/registro", "/recuperar-senha"];

/**
 * Provedor de Autenticação
 * 
 * Gerencia todo o estado de autenticação da aplicação:
 * - Token JWT
 * - Dados do usuário
 * - Persistência no localStorage
 * - Headers do Axios
 * - Redirecionamentos
 * - Validação automática do token
 * - Estado de carregamento inicial
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // ========================================
  // ESTADOS
  // ========================================

  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Inicia como true

  // ========================================
  // FUNÇÃO: BUSCAR DADOS DO USUÁRIO
  // ========================================

  /**
   * Busca os dados do usuário autenticado na API
   * 
   * @param authToken - Token JWT para autenticação
   */
  const fetchUsuario = useCallback(async (authToken: string) => {
    try {
      // Configura o header temporariamente para esta requisição
      const response = await api.get("/perfil/meu", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setUsuario(response.data);
      return true;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return false;
    }
  }, []);

  // ========================================
  // FUNÇÃO: LOGIN
  // ========================================

  /**
   * Realiza o login do usuário
   * 
   * 1. Salva token no localStorage
   * 2. Atualiza estado do token
   * 3. Configura header do Axios
   * 4. Busca dados do usuário
   * 5. Redireciona para dashboard
   */
  const login = useCallback(
    async (newToken: string) => {
      try {
        // Salva no localStorage para persistência
        localStorage.setItem(TOKEN_KEY, newToken);

        // Atualiza estado
        setToken(newToken);

        // Configura header padrão do Axios
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        // Busca dados do usuário
        const success = await fetchUsuario(newToken);

        if (success) {
          // Redireciona para dashboard
          router.push("/");
        } else {
          throw new Error("Falha ao buscar dados do usuário");
        }
      } catch (error) {
        console.error("Erro no login:", error);
        
        // Remove token inválido
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUsuario(null);
        delete api.defaults.headers.common["Authorization"];

        throw error;
      }
    },
    [router, fetchUsuario]
  );

  // ========================================
  // FUNÇÃO: LOGOUT
  // ========================================

  /**
   * Realiza o logout do usuário
   * 
   * 1. Remove token do localStorage
   * 2. Limpa estados
   * 3. Remove header do Axios
   * 4. Redireciona para login
   */
  const logout = useCallback(() => {
    // Remove do localStorage
    localStorage.removeItem(TOKEN_KEY);

    // Limpa estados
    setToken(null);
    setUsuario(null);

    // Remove header do Axios
    delete api.defaults.headers.common["Authorization"];

    // Redireciona para login
    router.push("/login");

    // Feedback visual
    toast.success("Logout realizado com sucesso!");
  }, [router]);

  // ========================================
  // EFEITO: CARREGAR TOKEN NA INICIALIZAÇÃO
  // ========================================

  useEffect(() => {
    /**
     * Verifica se existe token salvo no localStorage
     * e valida se ainda é válido
     * 
     * IMPORTANTE: Este useEffect gerencia o isLoading
     */
    const loadToken = async () => {
      try {
        // Busca token do localStorage
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (!storedToken) {
          // Sem token - finaliza carregamento
          setIsLoading(false);
          return;
        }

        // Configura header do Axios
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

        // Tenta buscar dados do usuário para validar o token
        const isValid = await fetchUsuario(storedToken);

        if (isValid) {
          // Token válido - atualiza estado
          setToken(storedToken);
        } else {
          // Token inválido - remove tudo
          localStorage.removeItem(TOKEN_KEY);
          delete api.defaults.headers.common["Authorization"];
        }
      } catch (error) {
        console.error("Erro ao carregar token:", error);
        localStorage.removeItem(TOKEN_KEY);
        delete api.defaults.headers.common["Authorization"];
      } finally {
        // SEMPRE finaliza o carregamento ao final
        setIsLoading(false);
      }
    };

    loadToken();
  }, [fetchUsuario]);

  // ========================================
  // EFEITO: PROTEÇÃO DE ROTAS
  // ========================================

  useEffect(() => {
    // Aguarda carregamento inicial
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    // Se não está autenticado e não está em rota pública
    if (!token && !isPublicRoute) {
      router.push("/login");
    }

    // Se está autenticado e está em rota de login
    if (token && pathname === "/login") {
      router.push("/");
    }
  }, [token, pathname, isLoading, router]);

  // ========================================
  // VALOR DO CONTEXTO
  // ========================================

  const value = {
    token,
    usuario,
    estaAutenticado: !!token,
    isLoading, // Exposto no contexto
    login,
    logout,
  };

  // ========================================
  // RENDER
  // ========================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}