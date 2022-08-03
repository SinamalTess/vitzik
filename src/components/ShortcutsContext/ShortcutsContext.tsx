import React from 'react'
import { ActiveShortcut } from '../../types/ActiveShortcut'

interface ShortcutsContextInterface {
    shortcuts: ActiveShortcut[]
    setShortcuts: React.Dispatch<React.SetStateAction<ActiveShortcut[]>>
}

export const ShortcutsContext = React.createContext<ShortcutsContextInterface>({
    shortcuts: [],
    setShortcuts: () => {},
})
