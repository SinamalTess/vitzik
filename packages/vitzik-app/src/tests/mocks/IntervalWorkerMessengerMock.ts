import { IntervalWorkerCode } from '../../types/IntervalWorkerCode'

export class IntervalWorkerMessengerMock {
    callbacks: Function[] = []

    restart = (startAt: number, midiSpeedFactor: number) => {
        this.callWith('restart', { startAt, midiSpeedFactor, time: startAt })
    }

    start = (startAt: number, midiSpeedFactor: number) => {
        this.callWith('start', { startAt, midiSpeedFactor, time: startAt })
    }

    stop = () => {
        this.callWith('stop', { time: 0 })
    }

    getTime = () => {
        this.callWith('getTime', { time: 0 })
    }

    pause = () => {
        this.callWith('pause', { time: 0 })
    }

    updateTimer = (startAt: number) => {
        this.callWith('updateTimer', { startAt, time: startAt })
    }

    subscribe = (callback: Function) => {
        this.callbacks.push(callback)
    }

    unsubscribe = (listener: Function) => {
        const indexCallback = this.callbacks.findIndex(
            (callback) => listener.toString() === callback.toString()
        )
        const copyCallbacks = [...this.callbacks]
        if (indexCallback) {
            this.callbacks = copyCallbacks.splice(indexCallback, 1)
        }
    }

    callWith = (
        code: IntervalWorkerCode,
        options: { startAt?: number; midiSpeedFactor?: number; time?: number }
    ) => {
        const { startAt, midiSpeedFactor, time } = options
        this.callbacks.forEach((callback) =>
            callback({
                data: {
                    code,
                    startAt,
                    midiSpeedFactor,
                    time,
                },
            })
        )
    }
}
