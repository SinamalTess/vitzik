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
        }
    }
}
