import React, { ReactNode, useState } from 'react'

interface IShortcutsContext {
    shortcuts: string[]
    setShortcuts: React.Dispatch<React.SetStateAction<string[]>>
}

interface ShortcutsContextProviderProps {
    children: ReactNode
}

export const ShortcutsContext = React.createContext<IShortcutsContext>({
    shortcuts: [],
    setShortcuts: () => {},
})

export function ShortcutsContextProvider({ children }: ShortcutsContextProviderProps) {
    const [shortcuts, setShortcuts] = useState<string[]>([])
    return (
        <ShortcutsContext.Provider value={{ shortcuts, setShortcuts }}>
            {children}
        </ShortcutsContext.Provider>
    )
}
