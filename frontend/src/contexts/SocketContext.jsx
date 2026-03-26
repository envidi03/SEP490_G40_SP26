import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { storage } from '../services/storage';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    const connectSocket = useCallback(() => {
        const token = storage.get('access_token') || sessionStorage.getItem('access_token');
        const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        if (!token) return null;

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            if (import.meta.env.DEV) console.log('Socket connected:', newSocket.id);
            setConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            if (import.meta.env.DEV) console.log('Socket disconnected:', reason);
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            if (import.meta.env.DEV) console.error('Socket connection error:', error);
            
            // If it's an authentication error, the token is likely invalid/expired.
            // Don't keep retrying with an invalid token to avoid console spam.
            if (error.message && (error.message.includes('Authentication') || error.message.includes('token'))) {
                console.warn('Socket authentication failed. Disconnecting...');
                newSocket.disconnect();
            }
            setConnected(false);
        });

        setSocket(newSocket);
        return newSocket;
    }, []);

    const disconnectSocket = useCallback(() => {
        setSocket(prevSocket => {
            if (prevSocket) {
                prevSocket.disconnect();
            }
            return null;
        });
        setConnected(false);
    }, []);

    useEffect(() => {
        let currentSocket = null;

        if (isAuthenticated && user) {
            currentSocket = connectSocket();
        }

        return () => {
            if (currentSocket) {
                currentSocket.disconnect();
                setSocket(null);
                setConnected(false);
            }
        };
    }, [isAuthenticated, user, connectSocket]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export default SocketContext;
