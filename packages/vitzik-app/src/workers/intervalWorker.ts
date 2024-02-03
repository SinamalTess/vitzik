import { IntervalWorkerCode, IntervalWorkerMessage } from '@/types/IntervalWorkerCode'
const FPS = 20
let timeElapsed = 0
let timer: number | NodeJS.Timeout | undefined

const startTimer = (startAt: number, midiSpeedFactor: number) => {
    const msInterval = 1000 / FPS
    timer = setInterval(() => {
        sendIntervalWorkerMessage('start', timeElapsed + msInterval / midiSpeedFactor)
    }, msInterval)
}

const stopTimer = () => {
    clearTimer()
    timeElapsed = 0
}

const clearTimer = () => {
    if (timer) clearInterval(timer)
}

const sendIntervalWorkerMessage = (code: IntervalWorkerCode, time?: number) => {
    postMessage({
        code,
        time: time ?? timeElapsed,
    })
    if (time !== undefined) timeElapsed = time
}

// eslint-disable-next-line no-restricted-globals
self.onmessage = (message) => {
    const { code, startAt = 0, midiSpeedFactor = 1 } = message.data as IntervalWorkerMessage

    if (code === 'start') {
        startTimer(startAt, midiSpeedFactor)
    } else if (code === 'updateTimer') {
        clearTimer()
        sendIntervalWorkerMessage(code, startAt)
    } else if (code === 'stop') {
        stopTimer()
        sendIntervalWorkerMessage(code, 0)
    } else if (code === 'pause') {
        clearTimer()
        sendIntervalWorkerMessage(code)
    } else if (code === 'restart') {
        clearTimer()
        startTimer(startAt, midiSpeedFactor)
    } else if (code === 'getTime') {
        sendIntervalWorkerMessage(code)
    }
}
