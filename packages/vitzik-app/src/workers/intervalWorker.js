/*
    This web worker posts a message on regular intervals.
    The defined fps (Frames Per Second) value will be used to calculate the interval duration.
    When told to 'start' the web worker starts an internal clock (in milliseconds) that updates the 'timeElapsed' value at each interval.
    The time of the clock is used by UI components to track the current time elapsed while playing a midi song.
    The clock can be stopped, paused and resumed at a specific time.
    For consistency, the web worker should only be receiving message that contains a 'code' property.
    When receiving a message the web worker always returns the current time of the clock.
*/

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const fps = 40
    const interval = 1000 / fps
    let timeElapsed = 0
    let clock = null

    const clearClock = () => {
        clearInterval(clock)
        timeElapsed = 0
    }
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (message) => {
        const { code, startAt, midiSpeedFactor } = message.data
        if (code === 'start') {
            clock = setInterval(() => {
                postMessage({
                    time: timeElapsed ?? startAt,
                })

                timeElapsed = timeElapsed + interval / midiSpeedFactor
            }, interval)
        } else if (code === 'seeking') {
            clearInterval(clock)
            postMessage({
                time: startAt,
            })
            timeElapsed = startAt
        } else if (code === 'stopped') {
            clearClock()
            postMessage({
                time: 0,
            })
        } else if (code === 'paused') {
            clearInterval(clock)
            postMessage({
                time: timeElapsed,
            })
        } else if (code === 'getTime') {
            postMessage({
                time: timeElapsed,
            })
        }
    }
}
