import React, { ReactNode, useState } from 'react'
import { ActiveShortcut } from '../../types/ActiveShortcut'

interface IShortcutsContext {
    shortcuts: ActiveShortcut[]
    setShortcuts: React.Dispatch<React.SetStateAction<ActiveShortcut[]>>
}

interface ShortcutsContextProviderProps {
    children: ReactNode
}

export const ShortcutsContext = React.createContext<IShortcutsContext>({
    shortcuts: [],
    setShortcuts: () => {},
})

export function ShortcutsContextProvider({ children }: ShortcutsContextProviderProps) {
    const [shortcuts, setShortcuts] = useState<ActiveShortcut[]>([])
    return (
        <ShortcutsContext.Provider value={{ shortcuts, setShortcuts }}>
            {children}
        </ShortcutsContext.Provider>
    )
}
