let ws: WebSocket | null = null;
const listeners: Map<string, ((data: any) => void)[]> = new Map();

export function initializeWebSocket() {
  if (ws) return;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connection established");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // If there are listeners for this event type, call them
      if (data.type && listeners.has(data.type)) {
        listeners.get(data.type)?.forEach(callback => callback(data));
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
    
    // Try to reconnect after a short delay
    setTimeout(() => {
      ws = null;
      initializeWebSocket();
    }, 3000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    ws?.close();
  };
}

export function sendMessage(data: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    console.error("WebSocket not open, cannot send message");
  }
}

export function addEventListener(type: string, callback: (data: any) => void) {
  if (!listeners.has(type)) {
    listeners.set(type, []);
  }
  
  listeners.get(type)?.push(callback);
}

export function removeEventListener(type: string, callback: (data: any) => void) {
  if (!listeners.has(type)) return;
  
  const callbacks = listeners.get(type) || [];
  listeners.set(type, callbacks.filter(cb => cb !== callback));
}

// Helper for delivery partners to update their location
export function updateDeliveryPartnerLocation(userId: number, latitude: number, longitude: number, isAvailable: boolean = true) {
  sendMessage({
    type: 'location_update',
    userId,
    latitude,
    longitude,
    isAvailable
  });
}
