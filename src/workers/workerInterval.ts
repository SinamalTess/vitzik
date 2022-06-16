// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (message) => {
        if (message.data === 'start') {
            setInterval(() => {
                postMessage({ interval: 10 })
            }, 10)
        }
    }
}
