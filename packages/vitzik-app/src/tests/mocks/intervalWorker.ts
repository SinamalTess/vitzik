export const terminate = jest.fn()
export const addEventListener = jest.fn()
export const onmessageerror = jest.fn()
export const dispatchEvent = jest.fn()
export const removeEventListener = jest.fn()
export const onerror = jest.fn()

export class IntervalWorkerMock {
    private url: string
    onmessage: (message: any) => void
    terminate: () => void
    addEventListener: (type: string, callback: Function) => void
    removeEventListener: (type: string, callback: Function) => void
    onmessageerror: () => void
    dispatchEvent: () => boolean
    onerror: () => void
    callbacks: Function[]
    postMessage: (message: any) => void

    constructor(stringUrl: string) {
        this.url = stringUrl
        this.onmessage = () => {}
        this.callbacks = []
        this.terminate = terminate
        this.addEventListener = (type: string, callback: Function) => {
            // @ts-ignore
            this.callbacks = [...this.callbacks, callback]
        }
        this.removeEventListener = (type: string, callback: Function) => {
            const indexCallback = this.callbacks.indexOf(callback)
            const copyCallbacks = [...this.callbacks]
            if (indexCallback) {
                this.callbacks = copyCallbacks.splice(indexCallback, 1)
            }
        }
        this.onmessageerror = onmessageerror
        this.dispatchEvent = dispatchEvent
        this.onerror = onerror
        this.postMessage = (message: any) => {
            this.onmessage(message)
            const { code, startAt } = message
            const callbacks = this.callbacks
            if (code === 'start') {
                callbacks.forEach((callback) =>
                    callback({
                        data: {
                            time: startAt + 10,
                        },
                    })
                )
            } else if (code === 'seeking') {
                callbacks.forEach((callback) =>
                    callback({
                        data: {
                            time: startAt,
                        },
                    })
                )
            } else if (code === 'stopped') {
                callbacks.forEach((callback) =>
                    callback({
                        data: {
                            time: 0,
                        },
                    })
                )
            } else if (code === 'paused') {
                callbacks.forEach((callback) =>
                    callback({
                        data: {
                            time: 10,
                        },
                    })
                )
            }
        }
    }
}
