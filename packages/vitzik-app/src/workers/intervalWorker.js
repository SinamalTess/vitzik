/*
    This web worker posts a message on regular intervals.
    The defined fps (Frames Per Second) value will be used to calculate the interval duration.
    When told to 'start' the web worker starts an internal timer (in milliseconds) that updates the 'timeElapsed' value at each interval.
    The time of the timer is used by UI components to track the current time elapsed while playing a midi song.
    The timer can be stopped, paused and resumed at a specific time.
    For consistency, the web worker should only be receiving message that contains a 'code' property.
    When receiving a message the web worker always returns the current value of the timer.
*/

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const fps = 20
    const interval = 1000 / fps
    let timeElapsed = 0
    let timer = null

    const stopTimer = () => {
        clearInterval(timer)
        timeElapsed = 0
    }

    const startTimer = (startAt, midiSpeedFactor) => {
        timer = setInterval(() => {
            postMessage({
                time: timeElapsed ?? startAt,
                code: 'start',
                interval,
            })

            timeElapsed = timeElapsed + interval / midiSpeedFactor
        }, interval)
    }

    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (message) => {
        const { code, startAt, midiSpeedFactor } = message.data

        if (code === 'start') {
            startTimer(startAt, midiSpeedFactor)
        } else if (code === 'updateTimer') {
            clearInterval(timer)
            postMessage({
                code,
                interval,
                time: startAt,
            })
            timeElapsed = startAt
        } else if (code === 'stop') {
            stopTimer()
            postMessage({
                code,
                interval,
                time: 0,
            })
        } else if (code === 'pause') {
            clearInterval(timer)
            postMessage({
                code,
                interval,
                time: timeElapsed,
            })
        } else if (code === 'getTime') {
            postMessage({
                code,
                interval,
                time: timeElapsed,
            })
        } else if (code === 'restart') {
            clearInterval(timer)
            startTimer(startAt, midiSpeedFactor)
        }
    }
}
