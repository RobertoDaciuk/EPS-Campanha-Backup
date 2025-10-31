/**
 * ============================================================================
 * AXIOS CLIENT - Cliente HTTP Configurado (REFATORADO)
 * ============================================================================
 *
 * REFATORAÇÃO (Sprint 18.2 - Segurança Avançada):
 * - CORRIGIDO Vulnerabilidade #13: Chave localStorage unificada
 * - ANTES: Buscava token em "auth_token" (diferente do AuthProvider)
 * - AGORA: Busca token em "@EPSCampanhas:token" (mesma chave do AuthProvider)
 * - RESULTADO: Interceptor agora encontra e injeta token corretamente
 *
 * Descrição:
 * Instância do Axios pré-configurada para comunicação com a API backend.
 * Inclui interceptors para injeção automática de token JWT e tratamento
 * de erros de autenticação.
 *
 * Configurações:
 * - baseURL: URL base da API (configurada via variável de ambiente)
 * - timeout: Tempo máximo de espera por resposta (30 segundos)
 * - headers: Headers padrão para todas as requisições
 * - withCredentials: Permite envio de cookies (se necessário)
 *
 * Interceptors:
 * - Request: Injeta token JWT no header Authorization (se disponível)
 * - Response: Trata erros de autenticação (401) e redireciona para login
 *
 * Integração com AuthProvider:
 * - AuthProvider armazena token em localStorage com chave "@EPSCampanhas:token"
 * - Este interceptor busca token da MESMA chave (CRÍTICO)
 * - Se chaves diferentes: Token não é injetado, requisições falham com 401
 *
 * @module AxiosClient
 * ============================================================================
 */

import axios from "axios";

/**
 * IMPORTANTE (Vulnerabilidade #13 - CORRIGIDO):
 * Esta chave DEVE ser EXATAMENTE igual à usada em AuthProvider.tsx
 * 
 * Localização: frontend/src/contexts/AuthProvider.tsx
 * Linha: const TOKEN_KEY = "@EPSCampanhas:token";
 * 
 * ANTES: const TOKEN_KEY = "auth_token"; (ERRADO - chave diferente)
 * AGORA: const TOKEN_KEY = "@EPSCampanhas:token"; (CORRETO - mesma chave)
 * 
 * Se as chaves forem diferentes:
 * - AuthProvider armazena token em uma chave
 * - Interceptor busca token em outra chave
 * - Resultado: Token NUNCA é encontrado ou injetado
 * - Todas as requisições autenticadas falham com 401
 */
const TOKEN_KEY = "@EPSCampanhas:token";

/**
 * Instância do Axios pré-configurada para a API.
 *
 * Configurações:
 * - baseURL: URL base da API (configurada via variável de ambiente)
 * - timeout: Tempo máximo de espera por resposta (30 segundos)
 * - headers: Headers padrão para todas as requisições
 * - withCredentials: Permite envio de cookies (se necessário)
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 30000, // 30 segundos
  headers: {
    "Content-Type": "application/json",
  },
  // Habilite se for usar cookies para autenticação
  // withCredentials: true,
});

// ==========================================
// INTERCEPTORS DE REQUISIÇÃO
// ==========================================

/**
 * Interceptor para adicionar token de autenticação
 * automaticamente em todas as requisições.
 *
 * Funcionamento:
 * 1. Antes de enviar requisição, verifica se token existe no localStorage
 * 2. Se token existe: Adiciona header Authorization: Bearer <token>
 * 3. Se token não existe: Envia requisição sem header (rota pública)
 *
 * IMPORTANTE (Vulnerabilidade #13 - CORRIGIDO):
 * - Busca token na chave "@EPSCampanhas:token" (MESMA do AuthProvider)
 * - ANTES buscava em "auth_token" (chave diferente, token nunca encontrado)
 * - AGORA busca na chave correta (token encontrado e injetado)
 *
 * Segurança:
 * - Token é injetado em TODAS as requisições (exceto rotas públicas)
 * - Backend valida token via JwtAuthGuard (Guard global)
 * - Token inválido/expirado: Backend retorna 401 Unauthorized
 */
api.interceptors.request.use(
  (config) => {
    /**
     * Verifica se está executando no navegador.
     * 
     * typeof window !== "undefined": Garante que está no client-side
     * (Next.js executa código no server-side durante SSR)
     */
    if (typeof window !== "undefined") {
      /**
       * Busca token no localStorage usando a MESMA chave do AuthProvider.
       * 
       * CRÍTICO: Esta chave DEVE ser idêntica à definida em AuthProvider.tsx
       * 
       * ANTES: localStorage.getItem("auth_token") (ERRADO)
       * AGORA: localStorage.getItem(TOKEN_KEY) onde TOKEN_KEY = "@EPSCampanhas:token" (CORRETO)
       */
      const token = localStorage.getItem(TOKEN_KEY);

      /**
       * Se token existe, adiciona header Authorization.
       * 
       * Formato: Authorization: Bearer <token>
       * 
       * Backend extrai token deste header via JwtAuthGuard.
       */
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    /**
     * Retorna config modificado.
     * 
     * Axios envia requisição com header Authorization (se token existe).
     */
    return config;
  },
  (error) => {
    /**
     * Se erro antes de enviar requisição (ex: config inválida),
     * rejeita Promise para tratamento no componente.
     */
    return Promise.reject(error);
  }
);

// ==========================================
// INTERCEPTORS DE RESPOSTA
// ==========================================

/**
 * Interceptor para tratar respostas da API.
 *
 * Funcionamento:
 * 1. Se resposta bem-sucedida (2xx): Retorna response normalmente
 * 2. Se erro 401 (Unauthorized): Remove token e redireciona para login
 * 3. Se outro erro: Repassa erro para tratamento no componente
 *
 * Tratamento de 401 Unauthorized:
 * - Indica que token JWT é inválido, expirado ou ausente
 * - Remove token do localStorage (força re-login)
 * - Redireciona para página de login
 * - Previne que usuário fique "preso" em estado autenticado inválido
 *
 * Segurança:
 * - Logout automático em caso de token inválido
 * - Previne acesso com token expirado
 * - Redireciona para login (user-friendly)
 */
api.interceptors.response.use(
  (response) => {
    /**
     * Se resposta bem-sucedida (status 2xx), retorna response normalmente.
     */
    return response;
  },
  (error) => {
    /**
     * Trata erro 401 Unauthorized (token inválido/expirado).
     *
     * Casos que geram 401:
     * - Token JWT expirado
     * - Token JWT inválido (assinatura incorreta)
     * - Token JWT ausente (rota protegida sem token)
     * - Usuário foi bloqueado/deletado após login
     */
    if (error.response?.status === 401) {
      /**
       * Verifica se está executando no navegador.
       */
      if (typeof window !== "undefined") {
        /**
         * Remove token do localStorage.
         * 
         * IMPORTANTE: Remove usando a MESMA chave do AuthProvider
         * (TOKEN_KEY = "@EPSCampanhas:token")
         */
        localStorage.removeItem(TOKEN_KEY);

        /**
         * Redireciona para página de login.
         * 
         * window.location.href: Força reload completo da página
         * (limpa estado do React e força re-autenticação)
         */
        window.location.href = "/login";
      }
    }

    /**
     * Repassa erro para tratamento no componente.
     * 
     * Componente pode tratar erro com try/catch ou .catch()
     */
    return Promise.reject(error);
  }
);

/**
 * Exporta instância configurada do Axios.
 * 
 * Uso:
 * ```
 * import api from "@/lib/axios";
 * 
 * // Requisição autenticada (token injetado automaticamente)
 * const response = await api.get("/perfil");
 * 
 * // Requisição pública (sem token)
 * const response = await api.post("/autenticacao/login", { email, senha });
 * ```
 */
export default api;
