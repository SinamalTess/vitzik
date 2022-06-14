// eslint-disable-next-line import/no-anonymous-default-export
const workerInterval = () => {
    setInterval(() => {
        postMessage({ interval: 10 })
    }, 10)
}

export default workerInterval
