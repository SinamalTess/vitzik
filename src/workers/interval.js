// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const fps = 30
    const interval = 1000 / fps
    let timeElapsed = 0
    let timer = null
    let currentTime = null
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (message) => {
        const { code } = message.data
        if (code === 'start') {
            const { midiSpeedFactor, startingTime } = message.data
            currentTime = startingTime + timeElapsed

            timer = setInterval(() => {
                postMessage({
                    code: 'interval',
                    interval,
                    currentTime: startingTime + timeElapsed,
                })
                timeElapsed = timeElapsed + interval / midiSpeedFactor
            }, interval)
        } else if (code === 'pause') {
            clearInterval(timer)
        } else if (code === 'seeking') {
            const { startingTime } = message.data
            postMessage({
                code: 'interval',
                interval,
                currentTime: startingTime,
            })
        }
    }
}
