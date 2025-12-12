// lib/websocket/emitNotification.ts

/**
 * Helper para emitir notificaciones en tiempo real
 * Este archivo se usa en los endpoints de API para enviar notificaciones vía WebSocket
 */

interface NotificationData {
    id: string
    userId: string
    title: string
    message: string
    type: string
    data?: any
    read: boolean
    createdAt: Date | string
}

/**
 * Emitir una notificación a un usuario específico
 */
export function emitNotificationToUser(userId: string, notification: NotificationData) {
    try {
        // Verificar si global.io existe (servidor con WebSocket)
        if (typeof global !== 'undefined' && (global as any).io) {
            const io = (global as any).io
            io.to(`user:${userId}`).emit('new_notification', notification)
            console.log(`📤 [WebSocket] Notification sent to user ${userId}:`, notification.title)
            return true
        } else {
            console.warn('⚠️ [WebSocket] Server not initialized, notification not sent')
            return false
        }
    } catch (error) {
        console.error('❌ [WebSocket] Error emitting notification:', error)
        return false
    }
}

/**
 * Emitir una notificación a todos los administradores
 */
export function emitNotificationToAdmins(notification: NotificationData) {
    try {
        if (typeof global !== 'undefined' && (global as any).io) {
            const io = (global as any).io
            io.to('admins').emit('new_notification', notification)
            console.log('📤 [WebSocket] Notification sent to all admins:', notification.title)
            return true
        } else {
            console.warn('⚠️ [WebSocket] Server not initialized, notification not sent')
            return false
        }
    } catch (error) {
        console.error('❌ [WebSocket] Error emitting notification to admins:', error)
        return false
    }
}

/**
 * Emitir una notificación a todos los empleados
 */
export function emitNotificationToEmployees(notification: NotificationData) {
    try {
        if (typeof global !== 'undefined' && (global as any).io) {
            const io = (global as any).io
            io.to('employees').emit('new_notification', notification)
            console.log('📤 [WebSocket] Notification sent to all employees:', notification.title)
            return true
        } else {
            console.warn('⚠️ [WebSocket] Server not initialized, notification not sent')
            return false
        }
    } catch (error) {
        console.error('❌ [WebSocket] Error emitting notification to employees:', error)
        return false
    }
}

/**
 * Emitir una notificación a todos los clientes
 */
export function emitNotificationToClients(notification: NotificationData) {
    try {
        if (typeof global !== 'undefined' && (global as any).io) {
            const io = (global as any).io
            io.to('clients').emit('new_notification', notification)
            console.log('📤 [WebSocket] Notification sent to all clients:', notification.title)
            return true
        } else {
            console.warn('⚠️ [WebSocket] Server not initialized, notification not sent')
            return false
        }
    } catch (error) {
        console.error('❌ [WebSocket] Error emitting notification to clients:', error)
        return false
    }
}

/**
 * Emitir una notificación a múltiples usuarios
 */
export function emitNotificationToUsers(userIds: string[], notification: NotificationData) {
    try {
        if (typeof global !== 'undefined' && (global as any).io) {
            const io = (global as any).io
            userIds.forEach(userId => {
                io.to(`user:${userId}`).emit('new_notification', notification)
            })
            console.log(`📤 [WebSocket] Notification sent to ${userIds.length} users:`, notification.title)
            return true
        } else {
            console.warn('⚠️ [WebSocket] Server not initialized, notification not sent')
            return false
        }
    } catch (error) {
        console.error('❌ [WebSocket] Error emitting notification to users:', error)
        return false
    }
}

/**
 * Notificar que una notificación fue marcada como leída
 */
export function emitNotificationMarkedRead(userId: string, notificationIds: string[]) {
    try {
        if (typeof global !== 'undefined' && (global as any).io) {
            const io = (global as any).io
            io.to(`user:${userId}`).emit('notifications_marked_read', notificationIds)
            console.log(`✅ [WebSocket] Notifications marked as read for user ${userId}`)
            return true
        }
        return false
    } catch (error) {
        console.error('❌ [WebSocket] Error emitting mark read event:', error)
        return false
    }
}

/**
 * Notificar que una notificación fue eliminada
 */
export function emitNotificationDeleted(userId: string, notificationId: string) {
    try {
        if (typeof global !== 'undefined' && (global as any).io) {
            const io = (global as any).io
            io.to(`user:${userId}`).emit('notification_deleted', notificationId)
            console.log(`🗑️ [WebSocket] Notification deleted for user ${userId}`)
            return true
        }
        return false
    } catch (error) {
        console.error('❌ [WebSocket] Error emitting delete event:', error)
        return false
    }
}