import { WebSocketServer, WebSocket } from 'ws';
import { storage } from '../storage';

// Connected clients
const clients = new Map<string, WebSocket>();

// Track which clients are subscribing to which orders
const orderSubscriptions = new Map<number, Set<string>>();

// Track which clients are subscribing to which riders
const riderSubscriptions = new Map<number, Set<string>>();

// Setup WebSocket server
export function setupWebSocketServer(wss: WebSocketServer) {
  wss.on('connection', (ws, req) => {
    // Generate client ID
    const clientId = Math.random().toString(36).substring(2, 15);
    
    // Store client
    clients.set(clientId, ws);
    
    console.log(`Client connected: ${clientId}`);
    
    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle message based on type
        switch (data.type) {
          case 'GET_ORDER_STATUS':
            await handleGetOrderStatus(clientId, data.payload);
            break;
            
          case 'SUBSCRIBE_TO_ORDER':
            handleSubscribeToOrder(clientId, data.payload);
            break;
            
          case 'UNSUBSCRIBE_FROM_ORDER':
            handleUnsubscribeFromOrder(clientId, data.payload);
            break;
            
          case 'LOCATION_UPDATE':
            handleLocationUpdate(clientId, data.payload);
            break;
            
          case 'GET_DASHBOARD_DATA':
            await handleGetDashboardData(clientId);
            break;
            
          default:
            console.warn(`Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      // Clean up client data
      clients.delete(clientId);
      
      // Remove from all subscriptions
      orderSubscriptions.forEach((subscribers, orderId) => {
        subscribers.delete(clientId);
        if (subscribers.size === 0) {
          orderSubscriptions.delete(orderId);
        }
      });
      
      riderSubscriptions.forEach((subscribers, riderId) => {
        subscribers.delete(clientId);
        if (subscribers.size === 0) {
          riderSubscriptions.delete(riderId);
        }
      });
      
      console.log(`Client disconnected: ${clientId}`);
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      payload: { clientId }
    }));
  });
}

// Handle order status request
async function handleGetOrderStatus(clientId: string, payload: any) {
  try {
    const { orderId } = payload;
    
    if (!orderId) {
      return;
    }
    
    // Get order details
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      sendToClient(clientId, {
        type: 'ORDER_UPDATE',
        payload: {
          orderId,
          error: 'Order not found'
        }
      });
      return;
    }
    
    // Subscribe client to order updates
    handleSubscribeToOrder(clientId, { orderId });
    
    // Send order status
    sendToClient(clientId, {
      type: 'ORDER_UPDATE',
      payload: {
        orderId,
        status: order.status,
        eta: order.eta,
        location: order.deliveryPartnerId ? await getDeliveryPartnerLocation(order.deliveryPartnerId) : null
      }
    });
  } catch (error) {
    console.error('Error getting order status:', error);
  }
}

// Handle order subscription
function handleSubscribeToOrder(clientId: string, payload: any) {
  const { orderId } = payload;
  
  if (!orderId) {
    return;
  }
  
  // Add client to order subscribers
  if (!orderSubscriptions.has(orderId)) {
    orderSubscriptions.set(orderId, new Set());
  }
  
  orderSubscriptions.get(orderId)?.add(clientId);
}

// Handle order unsubscription
function handleUnsubscribeFromOrder(clientId: string, payload: any) {
  const { orderId } = payload;
  
  if (!orderId) {
    return;
  }
  
  // Remove client from order subscribers
  orderSubscriptions.get(orderId)?.delete(clientId);
  
  if (orderSubscriptions.get(orderId)?.size === 0) {
    orderSubscriptions.delete(orderId);
  }
}

// Handle location update
async function handleLocationUpdate(clientId: string, payload: any) {
  try {
    const { location, deliveryId } = payload;
    
    if (!location || !deliveryId) {
      return;
    }
    
    // Update location in database
    await storage.updateLocation(deliveryId, location);
    
    // Broadcast location update to all clients subscribed to this delivery partner's orders
    broadcastLocationUpdate({
      deliveryPartnerId: deliveryId,
      location
    });
  } catch (error) {
    console.error('Error updating location:', error);
  }
}

// Handle dashboard data request
async function handleGetDashboardData(clientId: string) {
  try {
    const dashboardData = await storage.getDashboardData();
    
    sendToClient(clientId, {
      type: 'DASHBOARD_UPDATE',
      payload: dashboardData
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
  }
}

// Get delivery partner location
async function getDeliveryPartnerLocation(partnerId: number) {
  try {
    const partner = await storage.getDeliveryPartnerById(partnerId);
    return partner?.currentLocation || null;
  } catch (error) {
    console.error('Error getting delivery partner location:', error);
    return null;
  }
}

// Send message to specific client
function sendToClient(clientId: string, message: any) {
  const client = clients.get(clientId);
  
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

// Broadcast message to all clients subscribed to an order
function broadcastToOrderSubscribers(orderId: number, message: any) {
  const subscribers = orderSubscriptions.get(orderId);
  
  if (!subscribers) {
    return;
  }
  
  subscribers.forEach(clientId => {
    sendToClient(clientId, message);
  });
}

// Broadcast order update
export function broadcastOrderUpdate(data: {
  orderId: number;
  status: string;
  eta?: number;
  userId?: number;
  deliveryPartnerId?: number;
  location?: { lat: number; lng: number };
}) {
  broadcastToOrderSubscribers(data.orderId, {
    type: 'ORDER_UPDATE',
    payload: data
  });
}

// Broadcast location update
export function broadcastLocationUpdate(data: {
  orderId?: number;
  deliveryPartnerId: number;
  location: { lat: number; lng: number };
  userId?: number;
}) {
  // If orderId is provided, broadcast to order subscribers
  if (data.orderId) {
    broadcastToOrderSubscribers(data.orderId, {
      type: 'LOCATION_UPDATE',
      payload: {
        orderId: data.orderId,
        location: data.location
      }
    });
  }
  
  // Also broadcast to rider subscribers
  const subscribers = riderSubscriptions.get(data.deliveryPartnerId);
  
  if (subscribers) {
    subscribers.forEach(clientId => {
      sendToClient(clientId, {
        type: 'LOCATION_UPDATE',
        payload: {
          deliveryPartnerId: data.deliveryPartnerId,
          location: data.location
        }
      });
    });
  }
}
