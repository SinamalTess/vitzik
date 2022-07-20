import { useEffect, useState } from 'react'
import { AudioPlayerState } from '../../types'
import { usePrevious } from '../../_hooks'

interface TimeContextProviderProps {
    worker: Worker
    audioPlayerState: AudioPlayerState
    startAt: number
    midiSpeedFactor: number
}

export function TimeContextProvider({
    worker,
    midiSpeedFactor,
    startAt,
    audioPlayerState,
}: TimeContextProviderProps) {
    const [isStarted, setIsStarted] = useState(false)
    const prevMidiSpeedFactor = usePrevious(midiSpeedFactor)

    useEffect(() => {
        const start = () => {
            setIsStarted(true)
            if (!isStarted) {
                worker.postMessage({
                    code: 'start',
                    startAt,
                    midiSpeedFactor,
                })
            }
        }

        const pause = () => {
            setIsStarted(false)
            worker.postMessage({
                code: 'paused',
            })
        }

        const seekTo = () => {
            setIsStarted(false)
            worker.postMessage({
                code: 'seeking',
                startAt,
            })
        }

        const stop = () => {
            setIsStarted(false)
            worker.postMessage({
                code: 'stopped',
            })
        }

        if (prevMidiSpeedFactor !== midiSpeedFactor) {
            setIsStarted(false)
            worker.postMessage({
                code: 'paused',
            })
            setIsStarted(true)
            worker.postMessage({
                code: 'start',
                startAt,
                midiSpeedFactor,
            })
        }

        switch (audioPlayerState) {
            case 'playing':
                start()
                break
            case 'stopped':
                stop()
                break
            case 'paused':
                pause()
                break
            case 'seeking':
                seekTo()
                break
        }
    }, [audioPlayerState, isStarted, midiSpeedFactor, startAt, worker])

    return null
}
