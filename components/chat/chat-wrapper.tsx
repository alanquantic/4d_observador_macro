'use client';

import { useSession } from 'next-auth/react';
import { ObservadorMacroChat } from './observador-macro-chat';

export function ChatWrapper() {
  const { data: session, status } = useSession();

  // Solo mostrar el chat si el usuario está autenticado
  if (status === 'loading' || !session) {
    return null;
  }

  return <ObservadorMacroChat />;
}



