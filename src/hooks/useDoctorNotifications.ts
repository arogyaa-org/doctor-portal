// hooks/useDoctorNotifications.ts
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useDoctorNotifications = (doctorId: string | null) => {
    console.log("doctorId>>>", doctorId);
    const [rooms, setRooms] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Function to show notification
    const showNotification = (title: string, body: string, options?: NotificationOptions) => {
        console.log('🔔 Attempting to show notification:', { title, body });
        
        if (!('Notification' in window)) {
            console.log('❌ Browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            try {
                const notification = new Notification(title, {
                    body,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'doctor-room-update',
                    requireInteraction: false,
                    ...options
                });

                console.log('✅ Notification created successfully');

                notification.onclick = () => {
                    console.log('Notification clicked');
                    window.focus();
                    notification.close();
                };

                setTimeout(() => {
                    notification.close();
                }, 5000);

            } catch (error) {
                console.error('❌ Failed to create notification:', error);
            }
        } else {
            console.log('❌ Notification permission not granted. Current permission:', Notification.permission);
        }
    };

    useEffect(() => {
        if (!doctorId || doctorId === 'null' || doctorId === 'undefined') {
            console.log('⚠️ No valid doctorId provided, skipping socket connection');
            return;
        }

        console.log('🚀 Starting socket connection for doctorId:', doctorId);

        // Connect to your backend server
        const socket = io('http://localhost:4009', { // Update this to your actual backend URL
            transports: ['websocket'],
            autoConnect: true,
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        const handleConnect = () => {
            console.log('✅ Socket connected:', socket);
            setIsConnected(true);
            setConnectionError(null);

            showNotification('Connected to Server', 'Real-time notifications are now active');

            // Join doctor room immediately after connection
            console.log('🔵 Joining doctor room for:', doctorId);
            socket.emit('join-doctor', doctorId);
        };

        const handleDisconnect = (reason: string) => {
            console.log('❌ Socket disconnected:', reason);
            setIsConnected(false);
            showNotification('Disconnected', 'Connection to server lost');
        };

        const handleConnectError = (error: any) => {
            console.error('❌ Connection failed:', error.message);
            setConnectionError(`Connection failed: ${error.message}`);
            setIsConnected(false);
        };

        const handleJoinedRoom = (data: any) => {
            console.log('✅ Successfully joined doctor room:', data);
            
            if (data.success) {
                console.log('show notification');
                showNotification(
                    'Joined Doctor Room', 
                    `Successfully connected to your notification room (${data.roomSize} total connections)`
                );
            } else {
                console.error('❌ Failed to join doctor room:', data.error);
                showNotification('Room Join Failed', data.error || 'Failed to join notification room');
            }
        };

        const handleRoomUpdate = (updatedRooms: any) => {
            console.log('📱 Received room update:', updatedRooms);
            
            // Update rooms state
            setRooms(updatedRooms);
            
            // Show notification for live rooms
            const roomCount = updatedRooms.length;
            
            if (roomCount > 0) {
                const notificationTitle = 'Live Rooms Available!';
                const notificationBody = roomCount === 1 
                    ? 'You have 1 active room waiting for you'
                    : `You have ${roomCount} active rooms waiting for you`;

                console.log('🔔 Showing live room notification');
                showNotification(notificationTitle, notificationBody, {
                    tag: 'live-room-update',
                    requireInteraction: true,
                    icon: '/favicon.ico'
                });

                // Also play a sound if available
                try {
                    const audio = new Audio('/notification-sound.mp3'); // Add this sound file to your public folder
                    audio.play().catch(e => console.log('Could not play notification sound:', e));
                } catch (e) {
                    console.log('Notification sound not available');
                }
            }
        };

        const handleReconnect = () => {
            console.log('🔄 Socket reconnected');
            // Rejoin the doctor room after reconnection
            socket.emit('join-doctor', doctorId);
        };

        // Set up event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('reconnect', handleReconnect);
        socket.on('joined-doctor-room', handleJoinedRoom);
        socket.on('doctor-room-update', handleRoomUpdate);

        // Ping-pong for connection testing
        socket.on('pong', (data: any) => {
            console.log('🏓 Received pong:', data);
        });

        socketRef.current = socket;

        // Test connection with ping
        setTimeout(() => {
            if (socket.connected) {
                socket.emit('ping');
            }
        }, 1000);

        return () => {
            if (socketRef.current) {
                console.log('🧹 Cleaning up socket connection');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [doctorId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    // Test notification function
    const testNotification = () => {
        showNotification('Test Notification', 'This is a test notification to verify functionality');
    };

    // Manual room refresh function
    const refreshRooms = () => {
        if (socketRef.current && socketRef.current.connected && doctorId) {
            console.log('🔄 Manually refreshing rooms');
            socketRef.current.emit('get-doctor-rooms', doctorId);
        }
    };

    return { 
        rooms, 
        isConnected, 
        connectionError,
        hasDoctorId: !!doctorId,
        testNotification,
        refreshRooms
    };
};