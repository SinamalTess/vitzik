import { useContext, useEffect } from 'react'
import { registerKeyboardShortcut } from '../utils/keyboard_shortcuts'
import { AppContext } from '../components/_contexts'

/*
    Custom hook that subscribes a keyboard shortcut and adds it to the context.
    The shortcut can be removed later on throughout the application.
*/

export const useKeyboardShortcut = (
    code: string,
    callbackKeyDown: Function,
    callbackKeyUp?: Function
) => {
    const { shortcuts, setShortcuts } = useContext(AppContext)

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
    }, [callbackKeyDown, callbackKeyUp, code, shortcuts])
}
