export function registerShortcut(
    code: string,
    callbackKeyDown: Function,
    callbackKeyUp?: Function
) {
    function onKeyDownKeyboardShortcut(e: KeyboardEvent) {
        if (e.code === code) {
            callbackKeyDown()
        }
    }

    function onKeyUpKeyboardShortcut(e: KeyboardEvent) {
        if (e.code === code && callbackKeyUp) {
            callbackKeyUp()
        }
    }

    function subscribe() {
        document.addEventListener('keydown', onKeyDownKeyboardShortcut)
        if (callbackKeyUp) {
            document.addEventListener('keyup', onKeyUpKeyboardShortcut)
        }
    }

    subscribe()

    return function unsubscribe() {
        document.removeEventListener('keydown', onKeyDownKeyboardShortcut)
        if (callbackKeyUp) {
            document.removeEventListener('keyup', onKeyUpKeyboardShortcut)
        }
    }
}
