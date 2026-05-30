import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    throw new Error('getSocket() called on server')
  }

  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL

    if (!url) {
      // Return a no-op mock socket so the UI doesn't crash
      // when no socket server is running (e.g. Vercel preview)
      const noop = {
        emit: () => {},
        on: () => noop,
        off: () => noop,
        disconnect: () => {},
        connected: false,
      } as unknown as Socket
      return noop
    }

    socket = io(url, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 5000,
    })

    socket.on('connect_error', (err) => {
      console.warn('Socket connection failed:', err.message)
    })
  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}