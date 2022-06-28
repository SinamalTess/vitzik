// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const fps = 30
    const interval = 1000 / fps
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (message) => {
        if (message.data === 'start') {
            setInterval(() => {
                postMessage({ interval: interval })
            }, interval)
        }
    }
}
