'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PodiumCard, { PodiumUser } from '../../../components/ranking/PodiumCard'
import RankingListItem, { RankingUser } from '../../../components/ranking/RankingListItem'
import PaginationControls from '../../../components/ranking/PaginationControls'
import SkeletonPodium from '../../../components/ranking/SkeletonPodium'
import SkeletonRankingList from '../../../components/ranking/SkeletonRankingList'
import { useAuth } from '../../../contexts/AuthContext'
import axios from '../../../lib/axios'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface RankingApiResponse {
  dados: Array<RankingUser>
  paginaAtual: number
  totalPaginas: number
  total: number
}

const porPagina = 20

const RankingPage: React.FC = () => {
  const { usuario, estaAutenticado, isLoading: isAuthLoading } = useAuth()
  const [rankingData, setRankingData] = useState<RankingApiResponse | null>(null)
  const [minhaPosicao, setMinhaPosicao] = useState<number | null>(null)
  const [kpiData, setKpiData] = useState<any>(null) // Dados completos do KPI do vendedor
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const paginaAtual = parseInt(searchParams.get('pagina') || '1')

  useEffect(() => {
    if (isAuthLoading) return
    if (!estaAutenticado) {
      // redirecionar para login se necessário
      router.push('/login')
      return
    }

    const aborter = new AbortController()

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const rankingRes = await axios.get<RankingApiResponse>(`/ranking/geral?pagina=${paginaAtual}&porPagina=${porPagina}`, {
          signal: aborter.signal,
        })

        const kpiPromise = usuario?.papel === 'VENDEDOR' ? axios.get('/dashboard/vendedor', { signal: aborter.signal }) : Promise.resolve(null)

        const [rankingResp, kpiResp] = await Promise.all([rankingRes, kpiPromise])
        setRankingData(rankingResp.data)
        if (kpiResp && kpiResp.data) {
          setKpiData(kpiResp.data) // Salva dados completos do KPI
          if (typeof kpiResp.data.posicaoRanking === 'number') {
            setMinhaPosicao(kpiResp.data.posicaoRanking)
          }
        }
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return
        console.error(err)
        setError('Não foi possível carregar o ranking. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    return () => aborter.abort()
  }, [estaAutenticado, isAuthLoading, paginaAtual, usuario, router])

  // Helpers
  const dados = rankingData?.dados ?? []

  const isPrimeiraPagina = paginaAtual === 1

  const podium = isPrimeiraPagina ? dados.slice(0, 3) : []
  const restante = isPrimeiraPagina ? dados.slice(3) : dados

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold">Ranking Geral</h1>
        <p className="text-muted-foreground mt-1 text-sm">Confira a lista dos melhores vendedores e suba no pódio.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {isAuthLoading || isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SkeletonPodium />
            <div className="mt-4">
              <SkeletonRankingList count={porPagina} />
            </div>
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded bg-red-50 text-red-700">
            {error}
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* ==========================================
                PÓDIO - TOP 3
                ========================================== */}
            {!isLoading && podium.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mb-12 px-4"
              >
                <div className="w-full max-w-7xl mx-auto pt-12">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-center gap-12 lg:gap-6 w-full">
                    {/* 2º Lugar */}
                    <div className="order-2 lg:order-1 w-full lg:w-auto flex justify-center">
                      {podium[1] ? (
                        <PodiumCard user={podium[1]} size="md" />
                      ) : (
                        <div className="h-64 w-full lg:w-[240px]" />
                      )}
                    </div>

                    {/* 1º Lugar */}
                    <div className="order-1 lg:order-2 w-full lg:w-auto flex justify-center">
                      {podium[0] && <PodiumCard user={podium[0]} size="lg" />}
                    </div>

                    {/* 3º Lugar */}
                    <div className="order-3 w-full lg:w-auto flex justify-center">
                      {podium[2] ? (
                        <PodiumCard user={podium[2]} size="md" />
                      ) : (
                        <div className="h-64 w-full lg:w-[240px]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Divider */}
                <div className="mt-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </motion.section>
            )}

            {/* Minha posição (para vendedor) - CORRIGIDO */}
            {usuario?.papel === 'VENDEDOR' && minhaPosicao !== null && kpiData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative w-full max-w-4xl mx-auto mb-8 px-4"
              >
                <div className="relative flex items-center justify-between gap-6 p-6 lg:p-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:shadow-[0_0_60px_rgba(59,130,246,0.25)] transition-shadow duration-300">
                  
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl -z-10" />
                  
                  {/* Animated Border Glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-xl opacity-30 -z-20" />

                  {/* Left Section: Position Badge - CORRIGIDO: Centralizado Verticalmente */}
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="flex flex-col items-center justify-center gap-2 min-w-[80px]">
                      <div className="relative flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-primary/10 border border-primary/30 shadow-lg">
                        <span className="text-3xl lg:text-4xl font-black text-foreground">
                          #{minhaPosicao}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">

                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          Ranking Geral
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: User Info */}
                  <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex flex-col">
                      <h3 className="text-xl lg:text-2xl font-bold text-foreground">
                        {usuario.nome}
                      </h3>
                      {kpiData.nomeOptica && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                          {kpiData.nomeOptica}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-start lg:items-end gap-1">
                      <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                        {kpiData.pontosTotais?.toLocaleString('pt-BR') || 0} pts
                      </span>
                    </div>
                  </div>

                  {/* Bottom Glow */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-lg" />
                </div>
              </motion.div>
            )}


            {/* Lista principal */}
            <div className="space-y-3">
              {restante.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">Nenhum participante encontrado.</div>
              ) : (
                <motion.div initial="hidden" animate="visible" className="space-y-2">
                  {restante.map((u, idx) => (
                    <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                      <RankingListItem user={u} isCurrentUser={u.id === usuario?.id} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Paginação */}
            {rankingData && (
              <PaginationControls paginaAtual={rankingData.paginaAtual} totalPaginas={rankingData.totalPaginas} baseUrl="/ranking" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RankingPage
