import React, { ReactNode, useContext, useState } from 'react'
import { IIntervalWorkerContext, IntervalWorkerContext } from './IntervalWorkerContext'
import { IKeyboardShortcutsContext, KeyboardShortcutsContext } from './KeyboardShortcutsContext'

type IAppContext = IKeyboardShortcutsContext & IIntervalWorkerContext

interface AppContextProviderProps {
    children: ReactNode
}

export const AppContext = React.createContext<IAppContext>({
    intervalWorker: null,
    keyboardShortcuts: [],
    setKeyboardShortcuts: () => {},
})

export function AppContextProvider({ children }: AppContextProviderProps) {
    const { intervalWorker } = useContext(IntervalWorkerContext)

    const { keyboardShortcuts: keyboardShortcutsDefault } = useContext(KeyboardShortcutsContext)
    const [keyboardShortcuts, setKeyboardShortcuts] = useState<string[]>(keyboardShortcutsDefault)

    const appContextValue = {
        intervalWorker,
        keyboardShortcuts,
        setKeyboardShortcuts,
    }

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>
}
