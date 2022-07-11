// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const fps = 30
    const interval = 1000 / fps
    let count = 0
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (message) => {
        if (message.data.code === 'start') {
            const { midiSpeedFactor, startingTime } = message.data

            setInterval(() => {
                postMessage({
                    code: 'interval',
                    interval,
                    currentTime: startingTime + count,
                })
                count = count + interval / midiSpeedFactor
            }, interval)
        }
    }
}
