import { createContext, useContext } from "react";

/**
 * Interface do Usuário Autenticado
 * 
 * Dados básicos do usuário logado na plataforma
 */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: string;
}

/**
 * Interface do Contexto de Autenticação
 * 
 * Define todos os estados e métodos disponíveis
 * para gerenciar a autenticação do usuário
 */
export interface AuthContextData {
  /**
   * Token JWT do usuário autenticado
   * null quando não autenticado
   */
  token: string | null;

  /**
   * Dados do usuário autenticado
   * null quando não autenticado
   */
  usuario: Usuario | null;

  /**
   * Indica se o usuário está autenticado
   * Atalho para !!token
   */
  estaAutenticado: boolean;

  /**
   * Estado de carregamento inicial
   * true durante a verificação do token no localStorage
   * false após a validação (sucesso ou falha)
   * 
   * Use este estado para:
   * - Mostrar skeleton/spinner durante carregamento inicial
   * - Evitar redirecionamentos prematuros
   * - Aguardar confirmação de autenticação antes de renderizar conteúdo protegido
   */
  isLoading: boolean;

  /**
   * Realiza o login do usuário
   * 
   * @param token - Token JWT recebido da API
   */
  login: (token: string) => Promise<void>;

  /**
   * Realiza o logout do usuário
   * Remove token e redireciona para login
   */
  logout: () => void;
}

/**
 * Contexto de Autenticação
 * 
 * Provê estados e métodos para gerenciar
 * a autenticação em toda a aplicação
 */
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Hook customizado para acessar o contexto de autenticação
 * 
 * @returns Dados e métodos do contexto de autenticação
 * @throws Error se usado fora do AuthProvider
 * 
 * @example
 * ```tsx
 * const { usuario, login, logout, isLoading } = useAuth();
 * 
 * if (isLoading) {
 *   return <LoadingSpinner />;
 * }
 * 
 * if (!estaAutenticado) {
 *   router.push('/login');
 * }
 * ```
 */
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}