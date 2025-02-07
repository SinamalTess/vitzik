import React from 'react'
import { WebSocketMessenger } from '@/components/_contexts/WebSocketMessenger'

export interface IWebSocketContext {
    webSocket: WebSocketMessenger
}

export const WebSocketContext = React.createContext<IWebSocketContext>({
    webSocket: new WebSocketMessenger(),
})
