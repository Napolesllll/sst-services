// lib/websocket/notificationServer.ts
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { auth } from '@/lib/auth'

interface AuthenticatedSocket {
    userId: string
    userRole: string
}

// Mapa de sockets conectados por userId
const userSockets = new Map<string, Set<any>>()

let io: SocketIOServer | null = null

/**
 * Inicializar servidor WebSocket
 */
export function initWebSocketServer(httpServer: HTTPServer) {
    if (io) {
        console.log('WebSocket server already initialized')
        return io
    }

    io = new SocketIOServer(httpServer, {
        path: '/api/notifications/ws',
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            credentials: true
        },
        transports: ['websocket', 'polling']
    })

    io.on('connection', async (socket) => {
        console.log('🔌 New WebSocket connection:', socket.id)

        // Autenticar el socket usando la cookie de sesión
        const sessionToken = socket.handshake.auth.token

        if (!sessionToken) {
            console.log('❌ No auth token provided')
            socket.disconnect()
            return
        }

        // Aquí deberías verificar el token con tu sistema de autenticación
        // Por ahora, asumimos que el token contiene el userId
        const userId = socket.handshake.auth.userId
        const userRole = socket.handshake.auth.userRole

        if (!userId) {
            console.log('❌ No userId in token')
            socket.disconnect()
            return
        }

        // Guardar el socket en el mapa
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set())
        }
        userSockets.get(userId)!.add(socket)

        console.log(`✅ User ${userId} connected (${userSockets.get(userId)!.size} connections)`)

        // Unirse a una sala específica del usuario
        socket.join(`user:${userId}`)

        // Si es admin, unirse también a la sala de admins
        if (userRole === 'ADMINISTRADOR') {
            socket.join('admins')
            console.log(`👑 Admin ${userId} joined admins room`)
        }

        // Manejar desconexión
        socket.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected:', socket.id)
            const sockets = userSockets.get(userId)
            if (sockets) {
                sockets.delete(socket)
                if (sockets.size === 0) {
                    userSockets.delete(userId)
                    console.log(`❌ User ${userId} fully disconnected`)
                }
            }
        })

        // Ping/Pong para mantener la conexión viva
        socket.on('ping', () => {
            socket.emit('pong')
        })
    })

    console.log('🚀 WebSocket server initialized')
    return io
}

/**
 * Emitir notificación a un usuario específico
 */
export function emitNotificationToUser(userId: string, notification: any) {
    if (!io) {
        console.error('WebSocket server not initialized')
        return
    }

    // Emitir a todas las conexiones del usuario
    io.to(`user:${userId}`).emit('new_notification', notification)
    console.log(`📤 Notification sent to user ${userId}:`, notification.title)
}

/**
 * Emitir notificación a todos los administradores
 */
export function emitNotificationToAdmins(notification: any) {
    if (!io) {
        console.error('WebSocket server not initialized')
        return
    }

    io.to('admins').emit('new_notification', notification)
    console.log('📤 Notification sent to all admins:', notification.title)
}

/**
 * Emitir notificación a múltiples usuarios
 */
export function emitNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
        emitNotificationToUser(userId, notification)
    })
}

/**
 * Obtener servidor IO (para usar en otros lugares)
 */
export function getIO() {
    return io
}

/**
 * Verificar si un usuario está conectado
 */
export function isUserConnected(userId: string): boolean {
    return userSockets.has(userId) && userSockets.get(userId)!.size > 0
}

/**
 * Obtener número de conexiones activas
 */
export function getActiveConnectionsCount(): number {
    return userSockets.size
}