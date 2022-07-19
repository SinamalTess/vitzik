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
        document.documentElement.addEventListener('keydown', onKeyDownKeyboardShortcut)
        if (callbackKeyUp) {
            document.documentElement.addEventListener('keyup', onKeyUpKeyboardShortcut)
        }
    }

    subscribe()

    return function unsubscribe() {
        document.documentElement.removeEventListener('keydown', onKeyDownKeyboardShortcut)
        if (callbackKeyUp) {
            document.documentElement.removeEventListener('keyup', onKeyUpKeyboardShortcut)
        }
    }
}
