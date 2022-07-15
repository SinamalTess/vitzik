export const terminate = jest.fn()

export class Worker {
    private url: string
    onmessage: () => void
    terminate: () => void

    constructor(stringUrl: string) {
        this.url = stringUrl
        this.onmessage = () => {}
        this.terminate = terminate
    }

    postMessage() {
        this.onmessage()
    }

    removeEventListener() {}
}
