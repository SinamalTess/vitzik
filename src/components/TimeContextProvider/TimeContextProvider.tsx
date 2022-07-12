import { WebWorker } from '../../workers/WebWorker'
// @ts-ignore
import workerInterval from '../../workers/interval.js'
import React, { ReactNode, useEffect, useState } from 'react'
import { AudioPlayerState } from '../../types'

export const MidiCurrentTime = React.createContext(0)

interface TimeContextProviderProps {
    audioPlayerState: AudioPlayerState
    startingTime: number
    midiSpeedFactor: number
    children: ReactNode
}

export function TimeContextProvider({
    midiSpeedFactor,
    startingTime,
    audioPlayerState,
    children,
}: TimeContextProviderProps) {
    const [time, setTime] = useState<number>(0)

    useEffect(() => {
        let worker: Worker = WebWorker(workerInterval)

        function startInterval() {
            worker.postMessage({
                code: 'start',
                startingTime,
                midiSpeedFactor,
            })
        }

        function workerListener(message: MessageEvent) {
            const { code } = message.data
            if (code === 'interval') {
                const { currentTime } = message.data
                setTime(currentTime)
            }
        }

        switch (audioPlayerState) {
            case 'playing':
                startInterval()
                worker.addEventListener('message', workerListener)
                break
            case 'stopped':
                worker.terminate()
                setTime(0)
                worker.removeEventListener('message', workerListener)
                break
            case 'paused':
                worker.terminate()
                worker.removeEventListener('message', workerListener)
                break
            case 'seeking':
                worker.addEventListener('message', workerListener)
                worker.postMessage({
                    code: 'seeking',
                    startingTime,
                })
                break
        }

        return function cleanup() {
            worker.terminate()
            worker.removeEventListener('message', workerListener)
        }
    }, [audioPlayerState, midiSpeedFactor, startingTime])

    return <MidiCurrentTime.Provider value={time}>{children}</MidiCurrentTime.Provider>
}
