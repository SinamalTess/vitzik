import { IntervalWorkerMessage } from '@/types/IntervalWorkerCode'

const FPS = 20
const interval = 1000 / FPS
let timeElapsed = 0
let timer: number | NodeJS.Timeout | undefined

// eslint-disable-next-line no-restricted-globals
self.onmessage = (message) => {
    const { code, startAt = 0, midiSpeedFactor = 1 } = message.data as IntervalWorkerMessage

    if (code === 'start') {
        startTimer(startAt, midiSpeedFactor)
    } else if (code === 'updateTimer') {
        clearInterval(timer)
        postMessage({
            code,
            time: startAt,
        })
        timeElapsed = startAt
    } else if (code === 'stop') {
        stopTimer()
        postMessage({
            code,
            time: 0,
        })
    } else if (code === 'pause') {
        clearInterval(timer)
        postMessage({
            code,
            time: timeElapsed,
        })
    } else if (code === 'restart') {
        clearInterval(timer)
        startTimer(startAt, midiSpeedFactor)
    } else if (code === 'getTime') {
        postMessage({
            code,
            time: timeElapsed,
        })
    }
}

const stopTimer = () => {
    clearInterval(timer)
    timeElapsed = 0
}

const startTimer = (startAt: number, midiSpeedFactor: number) => {
    timer = setInterval(() => {
        postMessage({
            time: timeElapsed ?? startAt,
            code: 'start',
        })

        timeElapsed = timeElapsed + interval / midiSpeedFactor
    }, interval)
}
