export class IntervalWorkerMessenger {
    // @ts-ignore
    private worker: Worker = new Worker(new URL('../../workers/intervalWorker.ts', import.meta.url))

    restart = (startAt: number, midiSpeedFactor: number) => {
        this.worker.postMessage({
            code: 'restart',
            startAt,
            midiSpeedFactor,
        })
    }

    start = (startAt: number, midiSpeedFactor: number) => {
        this.worker.postMessage({
            code: 'start',
            startAt,
            midiSpeedFactor,
        })
    }

    stop = () => {
        this.worker.postMessage({
            code: 'stop',
        })
    }

    pause = () => {
        this.worker.postMessage({
            code: 'pause',
        })
    }

    updateTimer = (startAt: number) => {
        this.worker.postMessage({
            code: 'updateTimer',
            startAt,
        })
    }

    getTime = () => {
        this.worker.postMessage({
            code: 'getTime',
        })
    }

    subscribe = (callback: Function) => {
        // @ts-ignore
        this.worker.addEventListener('message', callback)
    }

    unsubscribe = (callback: Function) => {
        // @ts-ignore
        this.worker.removeEventListener('message', callback)
    }
}
