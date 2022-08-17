import React, { ReactNode, useContext, useState } from 'react'
import { IIntervalWorkerContext, IntervalWorkerContext } from './IntervalWorkerContext'
import { IShortcutsContext, ShortcutsContext } from './ShortcutsContext'

type IAppContext = IShortcutsContext & IIntervalWorkerContext

interface AppContextProviderProps {
    children: ReactNode
}

export const AppContext = React.createContext<IAppContext>({
    intervalWorker: null,
    shortcuts: [],
    setShortcuts: () => {},
})

export function AppContextProvider({ children }: AppContextProviderProps) {
    const { intervalWorker } = useContext(IntervalWorkerContext)
    const { shortcuts: shortcutsDefault } = useContext(ShortcutsContext)
    const [shortcuts, setShortcuts] = useState<string[]>(shortcutsDefault)
    const appContextValue = { intervalWorker, setShortcuts, shortcuts }

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>
}
