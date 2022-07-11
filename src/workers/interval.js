// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const fps = 30
    const interval = 1000 / fps
    let count = 0
    let port = null
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (message) => {
        if (message.data.code === 'start') {
            const { port: portReceived, midiCurrentTime, midiSpeedFactor } = message.data
            count = midiCurrentTime
            port = portReceived

            setInterval(() => {
                port.postMessage({
                    code: 'interval',
                    interval,
                    midiCurrentTime: count,
                })
                count = count + interval / midiSpeedFactor
            }, interval)
        } else if (message.data.code === 'stop') {
            const { code } = message.data
            port.postMessage({
                code,
            })
        }
    }
}
