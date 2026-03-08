"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Este componente roda de forma invisível no navegador dos membros
// Atualizando a tela deles em tempo real assim que o Banco de Dados muda
export default function RealtimeSync() {
  const router = useRouter();

  useEffect(() => {
    // A cada 3 segundos ele faz um "Soft Refresh" silencioso
    // Ele puxa os dados novos do servidor sem piscar a tela e sem perder a posição do scroll!
    const intervalId = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [router]);

  return null; // Componente Invisível
}
