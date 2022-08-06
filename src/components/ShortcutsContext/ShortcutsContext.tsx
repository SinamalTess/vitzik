import React, { ReactNode, useState } from 'react'
import { ActiveShortcut } from '../../types/ActiveShortcut'

interface ShortcutsContextInterface {
    shortcuts: ActiveShortcut[]
    setShortcuts: React.Dispatch<React.SetStateAction<ActiveShortcut[]>>
}

interface ShortcutsContextProviderProps {
    children: ReactNode
}

export const ShortcutsContext = React.createContext<ShortcutsContextInterface>({
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
