import React from 'react'

export interface IKeyboardShortcutsContext {
    keyboardShortcuts: string[]
    setKeyboardShortcuts: React.Dispatch<React.SetStateAction<string[]>>
}

export const KeyboardShortcutsContext = React.createContext<IKeyboardShortcutsContext>({
    keyboardShortcuts: [],
    setKeyboardShortcuts: () => {},
})
