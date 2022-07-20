export const terminate = jest.fn()
export const addEventListener = jest.fn()
export const onmessageerror = jest.fn()
export const dispatchEvent = jest.fn()
export const removeEventListener = jest.fn()
export const onerror = jest.fn()

export class Worker {
    private url: string
    onmessage: (message: any) => void
    terminate: () => void
    addEventListener: () => void
    removeEventListener: () => void
    onmessageerror: () => void
    dispatchEvent: () => boolean
    onerror: () => void

    constructor(stringUrl: string) {
        this.url = stringUrl
        this.onmessage = () => {}
        this.terminate = terminate
        this.addEventListener = addEventListener
        this.removeEventListener = removeEventListener
        this.onmessageerror = onmessageerror
        this.dispatchEvent = dispatchEvent
        this.onerror = onerror
    }

    postMessage(message: any) {
        this.onmessage(message)
    }
}
