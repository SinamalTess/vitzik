import { useEffect, useState } from 'react'
import { AudioPlayerState, MidiMetas } from '../../types'
import { usePrevious } from '../../_hooks'

interface IntervalWorkerManagerProps {
    intervalWorker: Worker
    midiMetas: MidiMetas
    playerState: AudioPlayerState
    startAt: number
    midiSpeedFactor: number
}

export function IntervalWorkerManager({
    intervalWorker,
    midiMetas,
    midiSpeedFactor,
    startAt,
    playerState,
}: IntervalWorkerManagerProps) {
    const [isStarted, setIsStarted] = useState(false)
    const prevMidiSpeedFactor = usePrevious(midiSpeedFactor)

    useEffect(() => {
        if (prevMidiSpeedFactor !== midiSpeedFactor) {
            setIsStarted(false)
            intervalWorker.postMessage({
                code: 'paused',
            })
            setIsStarted(true)
            intervalWorker.postMessage({
                code: 'start',
                startAt,
                midiSpeedFactor,
            })
        }

        switch (playerState) {
            case 'playing':
                setIsStarted(true)
                if (!isStarted) {
                    intervalWorker.postMessage({
                        code: 'start',
                        startAt,
                        midiSpeedFactor,
                    })
                }
                break
            case 'stopped':
                setIsStarted(false)
                intervalWorker.postMessage({
                    code: 'stopped',
                })
                break
            case 'paused':
                setIsStarted(false)
                intervalWorker.postMessage({
                    code: 'paused',
                })
                break
            case 'seeking':
                setIsStarted(false)
                intervalWorker.postMessage({
                    code: 'seeking',
                    startAt,
                })
                break
        }
    }, [midiMetas, playerState, isStarted, midiSpeedFactor, startAt, intervalWorker]) // midiMetas is used here to force the visualization to redraw on midiImport

    return null
}
