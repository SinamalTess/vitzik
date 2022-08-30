import { useContext, useEffect } from 'react'
import { AppContext } from '../components/_contexts'

/*
    Custom hook that listens for messages posted by the intervalWorker.
*/
export const useIntervalWorker = (callback: Function) => {
    const { intervalWorker } = useContext(AppContext)
    useEffect(() => {
        function onMessage(message: MessageEvent) {
            const { time, code } = message.data
            callback(time as number, code as string)
        }

        intervalWorker?.subscribe(onMessage)

        return function cleanup() {
            intervalWorker?.unsubscribe(onMessage)
        }
    }, [callback, intervalWorker])
}