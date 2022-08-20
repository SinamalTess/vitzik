import { useContext, useEffect, useState } from 'react'
import { AudioPlayerState, MidiMetas } from '../../types'
import { usePrevious } from '../../hooks'
import { AppContext } from '../_contexts'

interface IntervalWorkerManagerProps {
    midiMetas: MidiMetas
    playerState: AudioPlayerState
    startAt: number
    midiSpeedFactor: number
}

export function IntervalWorkerManager({
    midiMetas,
    midiSpeedFactor,
    startAt,
    playerState,
}: IntervalWorkerManagerProps) {
    const [isStarted, setIsStarted] = useState(false)
    const prevMidiSpeedFactor = usePrevious(midiSpeedFactor)
    const { intervalWorker } = useContext(AppContext)

    useEffect(() => {
        if (prevMidiSpeedFactor !== midiSpeedFactor) {
            intervalWorker?.postMessage({
                code: 'restart',
                startAt,
                midiSpeedFactor,
            })
        }

        switch (playerState) {
            case 'playing':
                setIsStarted(true)
                if (!isStarted) {
                    intervalWorker?.postMessage({
                        code: 'start',
                        startAt,
                        midiSpeedFactor,
                    })
                }
                break
            case 'stopped':
                setIsStarted(false)
                intervalWorker?.postMessage({
                    code: 'stop',
                })
                break
            case 'paused':
                setIsStarted(false)
                intervalWorker?.postMessage({
                    code: 'pause',
                })
                break
            case 'seeking':
                setIsStarted(false)
                intervalWorker?.postMessage({
                    code: 'updateTimer',
                    startAt,
                })
                break
        }
    }, [midiMetas, playerState, isStarted, midiSpeedFactor, startAt, intervalWorker]) // midiMetas is used here to force the visualization to redraw on midiImport

    return null
}
