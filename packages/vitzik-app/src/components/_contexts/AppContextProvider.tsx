import React, { ReactNode, useContext, useState } from 'react'
import { IIntervalWorkerContext, IntervalWorkerContext } from './IntervalWorkerContext'
import { IKeyboardShortcutsContext, KeyboardShortcutsContext } from './KeyboardShortcutsContext'
import { IWebSocketContext, WebSocketContext } from './WebSocketContext'

export type IAppContext = IKeyboardShortcutsContext & IIntervalWorkerContext & IWebSocketContext

interface AppContextProviderProps {
    children: ReactNode
}

export const AppContext = React.createContext<IAppContext>({
    intervalWorker: null,
    keyboardShortcuts: [],
    setKeyboardShortcuts: () => {},
    // @ts-ignore
    webSocket: () => {},
})

export function AppContextProvider({ children }: AppContextProviderProps) {
    const { intervalWorker } = useContext(IntervalWorkerContext)
    const { webSocket } = useContext(WebSocketContext)
    const { keyboardShortcuts: keyboardShortcutsDefault } = useContext(KeyboardShortcutsContext)
    const [keyboardShortcuts, setKeyboardShortcuts] = useState(keyboardShortcutsDefault)

    const appContextValue = {
        intervalWorker,
        webSocket,
        keyboardShortcuts,
        setKeyboardShortcuts,
    }

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>
}
