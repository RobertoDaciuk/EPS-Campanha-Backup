/**
 * ============================================================================
 * COMPONENTE: CONFETTI DO PÓDIO (Implementado) - Princípios 1, 3, 4
 * ============================================================================
 *
 * Propósito:
 * Renderiza um efeito de "explosão" de confetes para celebrar
 * a visualização do pódio, usando apenas `framer-motion` (Princípio 4)
 * para evitar dependências externas.
 *
 * Implementação:
 * - Usa `export function` (named export).
 * - Renderiza 50 elementos `motion.div` (confetes).
 * - Cada confete recebe valores aleatórios (delay, duração, posição)
 * para criar um efeito orgânico.
 *
 * @module Ranking
 * ============================================================================
 */
"use client";

import { motion } from "framer-motion";

/**
 * Gera um número aleatório dentro de um intervalo.
 */
const random = (min: number, max: number) =>
  Math.random() * (max - min) + min;

// Cores HSL (Princípio 4)
const coresConfete = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--warning))", // Amarelo/Ouro
  "hsl(var(--muted-foreground))", // Prata/Cinza
];

/**
 * Array de 50 elementos para gerar 50 confetes.
 */
const totalConfetes = Array(50).fill(0);

/**
 * Componente que renderiza um efeito de confete.
 * Não depende de bibliotecas externas.
 * Utiliza exportação nomeada (named export).
 */
export function PodiumConfetti() {
  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-50"
      aria-hidden="true"
    >
      {totalConfetes.map((_, i) => {
        const duracao = random(1.5, 2.5);
        const delay = random(0, 1.5);
        const xInicial = random(40, 60); // Inicia no centro (40% a 60%)
        const xFinal = random(-200, 200); // Espalha
        const yFinal = 500; // Cai para 500px
        const rotacao = random(180, 720);
        const cor = coresConfete[i % coresConfete.length];

        return (
          <motion.div
            key={i}
            initial={{
              opacity: 1,
              x: `${xInicial}vw`,
              y: -20,
              rotate: 0,
            }}
            animate={{
              opacity: 0,
              x: `${xInicial + xFinal}vw`, // Posição X final
              y: yFinal, // Posição Y final (caindo)
              rotate: rotacao, // Rotação
            }}
            transition={{
              duration: duracao,
              delay: delay,
              ease: "easeOut",
            }}
            className="absolute"
            style={{
              width: random(6, 12),
              height: random(6, 12),
              backgroundColor: cor,
              // Usa formas variadas para realismo
              borderRadius: i % 2 === 0 ? "50%" : "0%",
              left: 0,
              top: 0,
            }}
          />
        );
      })}
    </div>
  );
}