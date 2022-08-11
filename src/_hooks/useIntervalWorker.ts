import { useEffect } from 'react'

export const useIntervalWorker = (intervalWorker: Worker, callback: Function) => {
    useEffect(() => {
        function onMessage(message: MessageEvent) {
            const { time } = message.data
            callback(time as number)
        }

        intervalWorker.addEventListener('message', onMessage)

        return function cleanup() {
            intervalWorker.removeEventListener('message', onMessage)
        }
    }, [callback, intervalWorker])
}
