import React, { createContext } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '../config';

export const socket: Socket = io(config.webSocketHost, { secure: true });
export const SocketContext = createContext<Socket>(socket);