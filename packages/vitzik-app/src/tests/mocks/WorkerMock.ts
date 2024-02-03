import { Mock, vi } from 'vitest'

export class WorkerMock {
    url: string
    onmessage: Mock
    addEventListener: Mock
    removeEventListener: Mock

    constructor(stringUrl: string) {
        this.url = stringUrl
        this.onmessage = vi.fn()
        this.addEventListener = vi.fn()
        this.removeEventListener = vi.fn()
    }

    postMessage(msg: string): void {
        this.onmessage(msg)
    }
}
