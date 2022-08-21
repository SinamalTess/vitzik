import React from 'react'
import { WebWorker } from '../../workers/WebWorker'
// @ts-ignore
import intervalWorker from '../../workers/intervalWorker.js'

export interface IIntervalWorkerContext {
    intervalWorker: IntervalWorkerMessenger | null
}

class IntervalWorkerMessenger {
    private worker: Worker = WebWorker(intervalWorker)

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

export const IntervalWorkerContext = React.createContext<IIntervalWorkerContext>({
    intervalWorker: new IntervalWorkerMessenger(),
})
