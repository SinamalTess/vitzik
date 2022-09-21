import { IntervalWorkerCode } from '../../types/IntervalWorkerCode'

export class IntervalWorkerMessengerMock {
    callbacks: Function[] = []
    timeElapsed: number = 0

    restart = (startAt: number, midiSpeedFactor: number) => {
        this.timeElapsed = startAt
        this.callWith('restart', { startAt, midiSpeedFactor, time: this.timeElapsed })
    }

    start = (startAt: number, midiSpeedFactor: number) => {
        this.timeElapsed = startAt
        this.callWith('start', { startAt, midiSpeedFactor, time: this.timeElapsed })
    }

    stop = () => {
        this.timeElapsed = 0
        this.callWith('stop', { time: this.timeElapsed })
    }

    getTime = () => {
        this.callWith('getTime', { time: this.timeElapsed })
    }

    pause = () => {
        this.callWith('pause', { time: this.timeElapsed })
    }

    updateTimer = (startAt: number) => {
        this.timeElapsed = startAt
        this.callWith('updateTimer', { startAt, time: this.timeElapsed })
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
