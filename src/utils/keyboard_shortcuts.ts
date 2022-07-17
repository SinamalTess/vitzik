export function registerShortcut(code: string, callback: Function) {
    function action(e: KeyboardEvent) {
        if (e.code === code) {
            callback()
        }
    }

    function subscribe() {
        document.documentElement.addEventListener('keydown', action)
    }

    subscribe()

    return function unsubscribe() {
        document.documentElement.removeEventListener('keydown', action)
    }
}
