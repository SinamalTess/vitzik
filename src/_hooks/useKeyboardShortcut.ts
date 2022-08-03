import { useContext, useEffect } from 'react'
import { registerKeyboardShortcut } from '../utils/keyboard_shortcuts'
import { ActiveShortcut } from '../types/ActiveShortcut'
import { ShortcutsContext } from '../components/ShortcutsContext'

export const useKeyboardShortcut = (
    code: ActiveShortcut,
    callbackKeyDown: Function,
    callbackKeyUp?: Function
) => {
    const { shortcuts, setShortcuts } = useContext(ShortcutsContext)

    useEffect(() => {
        setShortcuts((shortcuts) => [...shortcuts, code])
    }, [])

    useEffect(() => {
        let unsubscribe: Function = () => {}

        if (shortcuts.includes(code)) {
            unsubscribe = registerKeyboardShortcut(code, callbackKeyDown, callbackKeyUp)
        }

        return function cleanup() {
            unsubscribe()
        }
    }, [shortcuts])
}
