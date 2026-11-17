/**
 * EventBus - Implements Domain Event Publishing / Subscribing
 * for Modular Monolith Architecture (PRD Section 8, 9.2).
 * Allows loose coupling between contexts:
 * - StokDilaporkan
 * - StatusStokBerubah
 * - BahayaDilaporkan
 * - BahayaAktif
 * - CuacaEkstremTerdeteksi
 * - KlaimDiajukan
 */

class DomainEventBus {
  constructor() {
    this.subscribers = {};
    this.history = [];
  }

  subscribe(eventType, callback) {
    if (!this.subscribers[eventType]) {
      this.subscribers[eventType] = [];
    }
    this.subscribers[eventType].push(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers[eventType] = this.subscribers[eventType].filter(cb => cb !== callback);
    };
  }

  publish(eventType, payload) {
    const eventObject = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.history.unshift(eventObject);
    if (this.history.length > 50) this.history.pop();

    if (this.subscribers[eventType]) {
      this.subscribers[eventType].forEach(callback => {
        try {
          callback(eventObject);
        } catch (err) {
          console.error(`[EventBus] Error in listener for ${eventType}:`, err);
        }
      });
    }

    // Also notify wildcard listeners
    if (this.subscribers['*']) {
      this.subscribers['*'].forEach(callback => {
        try {
          callback(eventObject);
        } catch (err) {
          console.error(`[EventBus] Error in wildcard listener:`, err);
        }
      });
    }

    return eventObject;
  }

  getRecentEvents() {
    return [...this.history];
  }
}

export const eventBus = new DomainEventBus();
export default eventBus;
