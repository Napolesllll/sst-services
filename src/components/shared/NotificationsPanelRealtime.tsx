"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import io, { Socket } from "socket.io-client";
import { notificationSound } from "@/lib/notificationSound";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsPanelRealtime() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const notificationQueueRef = useRef<Notification[]>([]);

  // Inicializar WebSocket
  useEffect(() => {
    if (!session?.user) return;

    const socket = io({
      path: "/api/notifications/ws",
      auth: {
        userId: session.user.id,
        userRole: session.user.role,
        token: "session-token",
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
      notificationSound.resume();
    });

    socket.on("connected", (data) => {
      console.log("🔌 Connected confirmation:", data);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      fetchNotifications();
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error);
    });

    socket.on("new_notification", (notification: Notification) => {
      console.log("🔔 New notification received:", notification);

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      if (soundEnabled && notificationSound.isEnabled()) {
        notificationSound.playForType(notification.type);
      }

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/logo.png",
          badge: "/icon.png",
          tag: notification.id,
        });
      }

      notificationQueueRef.current.push(notification);
    });

    socket.on("notification_deleted", (notificationId: string) => {
      console.log("🗑️ Notification deleted:", notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    socket.on("notifications_marked_read", (notificationIds: string[]) => {
      console.log("✅ Notifications marked as read:", notificationIds);
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    });

    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping");
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
    };
  }, [session?.user, soundEnabled]);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      requestNotificationPermission();
      const soundPref = localStorage.getItem("notificationSoundsEnabled");
      setSoundEnabled(soundPref !== "false");
    }
  }, [session?.user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=50");
      if (!response.ok) return;

      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Evitar que se propague el evento

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Solo decrementar el contador si la notificación no estaba leída
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const toggleSound = () => {
    const newState = notificationSound.toggle();
    setSoundEnabled(newState);

    if (newState) {
      notificationSound.playNotificationSound();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "service_requested":
      case "service_created":
        return (
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        );
      case "service_assigned":
      case "service_assigned_to_client":
        return (
          <div className="p-2 rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case "service_started":
        return (
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        );
      case "service_completed":
      case "service_completed_admin":
        return (
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-lg bg-gray-500/20 text-gray-400 flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString("es-CO", { month: "short", day: "numeric" });
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón de notificaciones */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
      >
        <div
          className={`absolute top-0 right-0 w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />

        <motion.svg
          animate={unreadCount > 0 ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </motion.svg>

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Panel de notificaciones */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed md:absolute right-2 md:right-0 mt-2 w-[calc(100vw-16px)] md:w-96 max-h-[85vh] md:max-h-[80vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[9999]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-3 md:p-4 z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base md:text-lg font-bold text-white">
                    Notificaciones
                  </h3>
                  {isConnected && (
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/50">
                      En linea
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSound}
                    className={`p-1.5 rounded-lg transition-colors ${
                      soundEnabled
                        ? "text-yellow-400 hover:bg-yellow-500/20"
                        : "text-gray-500 hover:bg-gray-700"
                    }`}
                    title={
                      soundEnabled ? "Desactivar sonidos" : "Activar sonidos"
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {soundEnabled ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                        />
                      )}
                    </svg>
                  </button>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      disabled={loading}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {loading ? "..." : "Marcar todas"}
                    </button>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">
                  {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
                </p>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto max-h-[calc(85vh-120px)] md:max-h-[calc(80vh-120px)] custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-6 md:p-8 text-center">
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-gray-400 text-sm">
                    No tienes notificaciones
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 md:p-4 hover:bg-gray-800/50 transition-colors ${
                        !notification.read ? "bg-blue-500/5" : ""
                      }`}
                    >
                      <div className="flex gap-2 md:gap-3">
                        {getNotificationIcon(notification.type)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4
                              className={`text-sm font-semibold pr-2 break-words ${
                                notification.read
                                  ? "text-gray-300"
                                  : "text-white"
                              }`}
                            >
                              {notification.title}
                            </h4>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="w-2 h-2 bg-blue-500 rounded-full hover:bg-blue-400 transition-colors"
                                  title="Marcar como leída"
                                />
                              )}

                              <button
                                onClick={(e) =>
                                  deleteNotification(notification.id, e)
                                }
                                className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10"
                                title="Eliminar notificación"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <p className="text-xs md:text-sm text-gray-400 mb-2 whitespace-normal break-words pr-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.8);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 1);
        }
      `}</style>
    </div>
  );
}
