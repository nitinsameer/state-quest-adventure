/**
 * Offline Event Queue for Firebase Analytics
 *
 * FIX #2: Persistence layer for failed events with retry mechanism
 * Ensures analytics events aren't lost when app is offline or Firebase fails
 * Events are queued locally and retried when connection is restored
 */

import { STORAGE_KEYS } from "@/constants/storageKeys";

export interface QueuedEvent {
  id: string;
  eventName: string;
  params?: Record<string, any>;
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = STORAGE_KEYS.eventQueue;
const MAX_QUEUE_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds before retry

class EventQueue {
  private queue: QueuedEvent[] = [];
  private isProcessing = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Load queued events from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      // Corrupt queue data - start fresh
      this.queue = [];
    }
  }

  /**
   * Persist queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // localStorage full - keep in memory only
    }
  }

  /**
   * Listen for online/offline events
   */
  private setupOnlineListener(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      // Retry processing when connection restored
      this.processQueue();
    });
  }

  /**
   * Add event to queue
   */
  enqueue(eventName: string, params?: Record<string, any>): void {
    // Prevent queue from growing unbounded
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest events
      this.queue = this.queue.slice(-MAX_QUEUE_SIZE + 1);
    }

    const event: QueuedEvent = {
      id: `${Date.now()}-${Math.random()}`,
      eventName,
      params,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(event);
    this.saveQueue();

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  /**
   * Process queue - send all queued events to Firebase
   * Called when processing succeeds or when network comes back online
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    try {
      const { analytics, isFirebaseConfigured } = await import("./firebase-init");

      if (!analytics || !isFirebaseConfigured || !navigator.onLine) {
        this.isProcessing = false;
        return;
      }

      const { logEvent } = await import("firebase/analytics");
      const toRemove: string[] = [];

      for (const event of this.queue) {
        try {
          logEvent(analytics, event.eventName, event.params);
          toRemove.push(event.id);
        } catch (error) {
          // Event failed - increment retry count
          if (event.retryCount < MAX_RETRIES) {
            event.retryCount++;
          } else {
            // Max retries exceeded - discard event
            toRemove.push(event.id);
          }
        }
      }

      // Remove successfully sent and abandoned events
      this.queue = this.queue.filter((e) => !toRemove.includes(e.id));
      this.saveQueue();

      // If there are still failed events, retry after delay
      if (this.queue.length > 0) {
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(() => {
          this.processQueue();
        }, RETRY_DELAY_MS);
      }
    } catch (error) {
      // Firebase import failed
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get queue size (for monitoring)
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear queue completely
   */
  clear(): void {
    this.queue = [];
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }
}

// Export singleton instance
export const eventQueue = new EventQueue();
