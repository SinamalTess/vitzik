export const terminate = jest.fn()
export const addEventListener = jest.fn()
export const onmessageerror = jest.fn()
export const dispatchEvent = jest.fn()
export const removeEventListener = jest.fn()
export const onerror = jest.fn()

export class WorkerMock {
    private url: string
    onmessage: (message: any) => void
    terminate: () => void
    addEventListener: (type: string, callback: Function) => void
    removeEventListener: () => void
    onmessageerror: () => void
    dispatchEvent: () => boolean
    onerror: () => void
    callback: Function[]
    postMessage: (message: any) => void

    constructor(stringUrl: string) {
        this.url = stringUrl
        this.onmessage = () => {}
        this.callback = []
        this.terminate = terminate
        this.addEventListener = (type: string, callback: Function) => {
            // @ts-ignore
            this.callback = [...this.callback, callback]
        }
        this.removeEventListener = removeEventListener
        this.onmessageerror = onmessageerror
        this.dispatchEvent = dispatchEvent
        this.onerror = onerror
        this.postMessage = (message: any) => {
            this.onmessage(message)
            const { code, startAt } = message
            const callbacks = this.callback
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
                            time: startAt + 10,
                        },
                    })
                )
            } else if (code === 'stopped') {
                callbacks.forEach((callback) =>
                    callback({
                        data: {
                            time: startAt + 10,
                        },
                    })
                )
            } else if (code === 'paused') {
                callbacks.forEach((callback) =>
                    callback({
                        data: {
                            time: startAt + 10,
                        },
                    })
                )
            }
        }
    }
}
