import { useContext } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from '../contexts/socketContext';

export const useSocket = ():Socket => useContext(SocketContext);