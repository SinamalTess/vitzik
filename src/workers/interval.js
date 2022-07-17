// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const fps = 30
    const interval = 1000 / fps
    let timeElapsed = 0
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (message) => {
        const { code } = message.data
        if (code === 'start') {
            const { midiSpeedFactor, startingTime } = message.data

            setInterval(() => {
                postMessage({
                    code: 'interval',
                    interval,
                    currentTime: startingTime + timeElapsed,
                })
                timeElapsed = timeElapsed + interval / midiSpeedFactor
            }, interval)
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
