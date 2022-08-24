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
    const { keyboardShortcuts, setKeyboardShortcuts } = useContext(AppContext)

    useEffect(() => {
        setKeyboardShortcuts((shortcuts) => [...shortcuts, code])
    }, [])

    useEffect(() => {
        let unsubscribe: Function = () => {}

        if (keyboardShortcuts.includes(code)) {
            unsubscribe = registerKeyboardShortcut(code, callbackKeyDown, callbackKeyUp)
        }

        console.log(keyboardShortcuts)

        return function cleanup() {
            unsubscribe()
        }
    }, [callbackKeyDown, callbackKeyUp, code, keyboardShortcuts])
}
