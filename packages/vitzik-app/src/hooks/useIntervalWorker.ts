import { useContext, useEffect, useRef } from 'react'
import { AppContext } from '../components/_contexts'

/*
    Custom hook that listens for messages posted by the intervalWorker.
*/
export const useIntervalWorker = (callback?: Function) => {
    const { intervalWorker } = useContext(AppContext)
    const timeRef = useRef(0)

    useEffect(() => {
        function onMessage(message: MessageEvent) {
            const { time, code } = message.data

            timeRef.current = time

            if (code !== 'getTime') {
                callback?.(time as number, code as string)
            }
        }

        intervalWorker?.subscribe(onMessage)
        intervalWorker?.getTime() // sets the first value for timeRef.current

        return function cleanup() {
            intervalWorker?.unsubscribe(onMessage)
        }
    }, [callback, intervalWorker])

    return { intervalWorker, timeRef }
}
