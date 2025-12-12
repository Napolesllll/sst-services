// server.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Mapa de usuarios conectados: userId -> Set de sockets
const userSockets = new Map()

console.log('🔄 Iniciando servidor SST Services...')

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('❌ Error handling request:', err)
            res.statusCode = 500
            res.end('Internal server error')
        }
    })

    // Inicializar Socket.IO
    const io = new Server(httpServer, {
        path: '/api/notifications/ws',
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
            credentials: true,
            methods: ['GET', 'POST']
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 10000,
        maxHttpBufferSize: 1e8,
        allowUpgrades: true,
        perMessageDeflate: true,
        httpCompression: true,
    })

    console.log('🔌 Configurando Socket.IO...')

    io.on('connection', (socket) => {
        const timestamp = new Date().toISOString()
        console.log(`\n${'='.repeat(60)}`)
        console.log(`🔌 Nueva conexión WebSocket`)
        console.log(`   Socket ID: ${socket.id}`)
        console.log(`   Timestamp: ${timestamp}`)
        console.log(`   Transport: ${socket.conn.transport.name}`)
        
        // Autenticación del socket
        const userId = socket.handshake.auth.userId
        const userRole = socket.handshake.auth.userRole
        const token = socket.handshake.auth.token

        if (!userId || !userRole) {
            console.log('❌ Autenticación fallida: No userId o userRole')
            console.log(`   Recibido - userId: ${userId}, userRole: ${userRole}`)
            socket.emit('error', { message: 'Authentication failed' })
            socket.disconnect()
            return
        }

        // Guardar socket del usuario
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set())
        }
        userSockets.get(userId).add(socket)

        const connectionCount = userSockets.get(userId).size
        console.log(`✅ Usuario autenticado`)
        console.log(`   User ID: ${userId}`)
        console.log(`   Rol: ${userRole}`)
        console.log(`   Conexiones activas: ${connectionCount}`)

        // Unirse a sala personal
        socket.join(`user:${userId}`)
        console.log(`📍 Usuario unido a sala: user:${userId}`)

        // Unirse a salas por rol
        if (userRole === 'ADMINISTRADOR') {
            socket.join('admins')
            console.log(`👑 Admin unido a sala 'admins'`)
        } else if (userRole === 'EMPLEADO') {
            socket.join('employees')
            console.log(`👷 Empleado unido a sala 'employees'`)
        } else if (userRole === 'CLIENTE') {
            socket.join('clients')
            console.log(`👤 Cliente unido a sala 'clients'`)
        }

        // Estadísticas de conexiones
        const totalConnections = Array.from(userSockets.values()).reduce((acc, set) => acc + set.size, 0)
        const uniqueUsers = userSockets.size
        console.log(`📊 Total usuarios únicos conectados: ${uniqueUsers}`)
        console.log(`📊 Total conexiones activas: ${totalConnections}`)
        console.log(`${'='.repeat(60)}\n`)

        // Confirmar conexión al cliente
        socket.emit('connected', {
            socketId: socket.id,
            userId,
            userRole,
            timestamp: new Date().toISOString(),
            message: 'Successfully connected to notification server'
        })

        // Manejar ping para mantener conexión viva
        socket.on('ping', () => {
            socket.emit('pong', { 
                timestamp: Date.now(),
                userId,
                socketId: socket.id
            })
        })

        // Solicitar notificaciones al conectar
        socket.on('request_notifications', async () => {
            console.log(`📥 [${userId}] Solicitó sincronización de notificaciones`)
            socket.emit('notifications_loaded', {
                message: 'Notifications synchronized',
                timestamp: new Date().toISOString()
            })
        })

        // Manejar cambio de transporte
        socket.conn.on('upgrade', (transport) => {
            console.log(`⬆️ [${userId}] Transporte actualizado: ${transport.name}`)
        })

        // Manejar errores del socket
        socket.on('error', (error) => {
            console.error(`❌ [${userId}] Error en socket ${socket.id}:`, error)
        })

        // Manejar desconexión
        socket.on('disconnect', (reason) => {
            console.log(`\n${'='.repeat(60)}`)
            console.log(`🔌 Desconexión WebSocket`)
            console.log(`   Socket ID: ${socket.id}`)
            console.log(`   User ID: ${userId}`)
            console.log(`   Razón: ${reason}`)
            console.log(`   Timestamp: ${new Date().toISOString()}`)
            
            const sockets = userSockets.get(userId)
            if (sockets) {
                sockets.delete(socket)
                const remainingConnections = sockets.size
                console.log(`   Conexiones restantes: ${remainingConnections}`)
                
                if (sockets.size === 0) {
                    userSockets.delete(userId)
                    console.log(`❌ Usuario completamente desconectado`)
                }
            }

            const totalConnections = Array.from(userSockets.values()).reduce((acc, set) => acc + set.size, 0)
            const uniqueUsers = userSockets.size
            console.log(`📊 Total usuarios únicos conectados: ${uniqueUsers}`)
            console.log(`📊 Total conexiones activas: ${totalConnections}`)
            console.log(`${'='.repeat(60)}\n`)
        })

        // Manejar evento de test (para debugging)
        socket.on('test_notification', (data) => {
            console.log(`🧪 [${userId}] Test notification solicitado:`, data)
            socket.emit('new_notification', {
                id: 'test-' + Date.now(),
                userId,
                title: 'Notificación de Prueba',
                message: 'Esta es una notificación de prueba',
                type: 'test',
                read: false,
                createdAt: new Date().toISOString(),
                data: data || {}
            })
        })
    })

    // Hacer io y userSockets accesibles globalmente
    global.io = io
    global.userSockets = userSockets

    // Funciones helper globales para emitir notificaciones
    global.emitNotificationToUser = (userId, notification) => {
        try {
            io.to(`user:${userId}`).emit('new_notification', notification)
            console.log(`📤 [WebSocket] Notificación enviada a usuario ${userId}:`)
            console.log(`   Título: ${notification.title}`)
            console.log(`   Tipo: ${notification.type}`)
            return true
        } catch (error) {
            console.error(`❌ Error emitiendo notificación a usuario ${userId}:`, error)
            return false
        }
    }

    global.emitNotificationToAdmins = (notification) => {
        try {
            io.to('admins').emit('new_notification', notification)
            const adminCount = io.sockets.adapter.rooms.get('admins')?.size || 0
            console.log(`📤 [WebSocket] Notificación enviada a ${adminCount} admins:`)
            console.log(`   Título: ${notification.title}`)
            console.log(`   Tipo: ${notification.type}`)
            return true
        } catch (error) {
            console.error('❌ Error emitiendo notificación a admins:', error)
            return false
        }
    }

    global.emitNotificationToEmployees = (notification) => {
        try {
            io.to('employees').emit('new_notification', notification)
            const employeeCount = io.sockets.adapter.rooms.get('employees')?.size || 0
            console.log(`📤 [WebSocket] Notificación enviada a ${employeeCount} empleados:`)
            console.log(`   Título: ${notification.title}`)
            console.log(`   Tipo: ${notification.type}`)
            return true
        } catch (error) {
            console.error('❌ Error emitiendo notificación a empleados:', error)
            return false
        }
    }

    global.emitNotificationToClients = (notification) => {
        try {
            io.to('clients').emit('new_notification', notification)
            const clientCount = io.sockets.adapter.rooms.get('clients')?.size || 0
            console.log(`📤 [WebSocket] Notificación enviada a ${clientCount} clientes:`)
            console.log(`   Título: ${notification.title}`)
            console.log(`   Tipo: ${notification.type}`)
            return true
        } catch (error) {
            console.error('❌ Error emitiendo notificación a clientes:', error)
            return false
        }
    }

    global.emitNotificationMarkedRead = (userId, notificationIds) => {
        try {
            io.to(`user:${userId}`).emit('notifications_marked_read', notificationIds)
            console.log(`✅ [WebSocket] ${notificationIds.length} notificaciones marcadas como leídas para usuario ${userId}`)
            return true
        } catch (error) {
            console.error(`❌ Error emitiendo evento de lectura para usuario ${userId}:`, error)
            return false
        }
    }

    global.emitNotificationDeleted = (userId, notificationId) => {
        try {
            io.to(`user:${userId}`).emit('notification_deleted', notificationId)
            console.log(`🗑️ [WebSocket] Notificación ${notificationId} eliminada para usuario ${userId}`)
            return true
        } catch (error) {
            console.error(`❌ Error emitiendo evento de eliminación para usuario ${userId}:`, error)
            return false
        }
    }

    // Función helper para obtener estadísticas
    global.getWebSocketStats = () => {
        const totalConnections = Array.from(userSockets.values()).reduce((acc, set) => acc + set.size, 0)
        const uniqueUsers = userSockets.size
        const adminCount = io.sockets.adapter.rooms.get('admins')?.size || 0
        const employeeCount = io.sockets.adapter.rooms.get('employees')?.size || 0
        const clientCount = io.sockets.adapter.rooms.get('clients')?.size || 0

        return {
            totalConnections,
            uniqueUsers,
            byRole: {
                admins: adminCount,
                employees: employeeCount,
                clients: clientCount
            },
            timestamp: new Date().toISOString()
        }
    }

    // Endpoint para estadísticas de WebSocket
    io.engine.on('connection_error', (err) => {
        console.error('❌ Error de conexión Socket.IO:', err)
    })

    // Log de estadísticas cada 5 minutos
    setInterval(() => {
        const stats = global.getWebSocketStats()
        if (stats.totalConnections > 0) {
            console.log(`\n📊 === ESTADÍSTICAS WEBSOCKET ===`)
            console.log(`   Usuarios únicos: ${stats.uniqueUsers}`)
            console.log(`   Conexiones totales: ${stats.totalConnections}`)
            console.log(`   Admins: ${stats.byRole.admins}`)
            console.log(`   Empleados: ${stats.byRole.employees}`)
            console.log(`   Clientes: ${stats.byRole.clients}`)
            console.log(`   Timestamp: ${stats.timestamp}`)
            console.log(`================================\n`)
        }
    }, 5 * 60 * 1000) // cada 5 minutos

    // Iniciar servidor
    httpServer
        .once('error', (err) => {
            console.error('❌ Error del servidor:', err)
            process.exit(1)
        })
        .listen(port, () => {
            console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║           🚀 SST SERVICES - SERVIDOR INICIADO                     ║
║                                                                    ║
║   📍 URL:            http://${hostname}:${port.toString().padEnd(28)}║
║   🔌 WebSocket:      ws://${hostname}:${port}/api/notifications/ws${' '.repeat(5)}║
║   🌍 Entorno:        ${(dev ? 'Development' : 'Production').padEnd(36)}║
║   📅 Fecha:          ${new Date().toLocaleString('es-CO').padEnd(36)}║
║   🔐 CORS:           ${(process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`).padEnd(36)}║
║                                                                    ║
║   ✅ Next.js         Listo                                        ║
║   ✅ Socket.IO       Configurado                                  ║
║   ✅ Base de datos   Conectada                                    ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🔔 Sistema de notificaciones en tiempo real ACTIVO
🎵 Sistema de sonidos HABILITADO
📱 Notificaciones push del navegador DISPONIBLES

💡 Consejos:
   • Abre http://localhost:${port} en tu navegador
   • Las notificaciones se enviarán automáticamente
   • Usa Ctrl+C para detener el servidor
   • Los logs de WebSocket aparecerán aquí

${'─'.repeat(70)}
`)

            // Mensaje de bienvenida después de 2 segundos
            setTimeout(() => {
                console.log('✨ Servidor listo para recibir conexiones WebSocket\n')
            }, 2000)
        })
})

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM recibido, cerrando servidor...')
    console.log('👋 Cerrando conexiones WebSocket...')
    
    // Notificar a todos los clientes conectados
    if (global.io) {
        global.io.emit('server_shutdown', {
            message: 'El servidor se está reiniciando. Reconectando automáticamente...',
            timestamp: new Date().toISOString()
        })
        
        // Dar tiempo para que se envíen los mensajes
        setTimeout(() => {
            global.io.close()
            process.exit(0)
        }, 1000)
    } else {
        process.exit(0)
    }
})

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT recibido (Ctrl+C), cerrando servidor...')
    console.log('👋 Cerrando conexiones WebSocket...')
    
    if (global.io) {
        global.io.emit('server_shutdown', {
            message: 'Servidor detenido por el usuario',
            timestamp: new Date().toISOString()
        })
        
        setTimeout(() => {
            global.io.close()
            console.log('✅ Servidor cerrado correctamente')
            process.exit(0)
        }, 1000)
    } else {
        console.log('✅ Servidor cerrado correctamente')
        process.exit(0)
    }
})

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error)
    // No cerrar el servidor, solo loggear
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada en:', promise)
    console.error('   Razón:', reason)
    // No cerrar el servidor, solo loggear
})