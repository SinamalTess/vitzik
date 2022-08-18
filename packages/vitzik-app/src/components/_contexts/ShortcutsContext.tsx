import React from 'react'

export interface IShortcutsContext {
    shortcuts: string[]
    setShortcuts: React.Dispatch<React.SetStateAction<string[]>>
}

export const ShortcutsContext = React.createContext<IShortcutsContext>({
    shortcuts: [],
    setShortcuts: () => {},
})
