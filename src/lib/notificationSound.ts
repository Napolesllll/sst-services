// lib/notificationSound.ts

/**
 * Sistema de sonidos para notificaciones
 * Genera sonidos usando Web Audio API (sin necesidad de archivos mp3)
 */

class NotificationSoundSystem {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        // Inicializar AudioContext solo en el navegador
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            // Cargar preferencia del usuario desde localStorage
            const savedPreference = localStorage.getItem('notificationSoundsEnabled');
            this.enabled = savedPreference !== 'false'; // Por defecto true
        }
    }

    /**
     * Reproducir sonido de notificación general
     */
    playNotificationSound() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const ctx = this.audioContext;
            const currentTime = ctx.currentTime;

            // Crear oscilador para el tono principal
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Configurar el sonido - tono agradable
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, currentTime); // Frecuencia inicial
            oscillator.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.1); // Subir tono

            // Envelope para suavizar
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + 0.3);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }

    /**
     * Reproducir sonido para notificación importante (asignación, completado)
     */
    playImportantSound() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const ctx = this.audioContext;
            const currentTime = ctx.currentTime;

            // Primer tono
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(600, currentTime);
            gain1.gain.setValueAtTime(0, currentTime);
            gain1.gain.linearRampToValueAtTime(0.2, currentTime + 0.01);
            gain1.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);

            osc1.start(currentTime);
            osc1.stop(currentTime + 0.15);

            // Segundo tono (más alto)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(800, currentTime + 0.1);
            gain2.gain.setValueAtTime(0, currentTime + 0.1);
            gain2.gain.linearRampToValueAtTime(0.25, currentTime + 0.11);
            gain2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.35);

            osc2.start(currentTime + 0.1);
            osc2.stop(currentTime + 0.35);
        } catch (error) {
            console.error('Error playing important sound:', error);
        }
    }

    /**
     * Reproducir sonido de éxito (servicio completado)
     */
    playSuccessSound() {
        if (!this.enabled || !this.audioContext) return;

        try {
            const ctx = this.audioContext;
            const currentTime = ctx.currentTime;

            // Secuencia de tonos ascendentes
            const frequencies = [523.25, 659.25, 783.99]; // Do, Mi, Sol

            frequencies.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, currentTime);

                const startTime = currentTime + (index * 0.1);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

                osc.start(startTime);
                osc.stop(startTime + 0.15);
            });
        } catch (error) {
            console.error('Error playing success sound:', error);
        }
    }

    /**
     * Reproducir sonido según el tipo de notificación
     */
    playForType(notificationType: string) {
        switch (notificationType) {
            case 'service_completed':
            case 'service_completed_admin':
                this.playSuccessSound();
                break;
            case 'service_assigned':
            case 'service_assigned_to_client':
            case 'service_started':
                this.playImportantSound();
                break;
            default:
                this.playNotificationSound();
        }
    }

    /**
     * Activar/desactivar sonidos
     */
    toggle() {
        this.enabled = !this.enabled;
        if (typeof window !== 'undefined') {
            localStorage.setItem('notificationSoundsEnabled', String(this.enabled));
        }
        return this.enabled;
    }

    /**
     * Verificar si los sonidos están activados
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Reanudar el contexto de audio (necesario después de interacción del usuario)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}

// Singleton para usar en toda la app
export const notificationSound = new NotificationSoundSystem();