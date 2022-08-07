import { useEffect, useState } from 'react'
import { AudioPlayerState, MidiMetas } from '../../types'
import { usePrevious } from '../../_hooks'

interface IntervalWorkerManagerProps {
    worker: Worker
    midiMetas: MidiMetas
    state: AudioPlayerState
    startAt: number
    midiSpeedFactor: number
}

export function IntervalWorkerManager({
    worker,
    midiMetas,
    midiSpeedFactor,
    startAt,
    state,
}: IntervalWorkerManagerProps) {
    const [isStarted, setIsStarted] = useState(false)
    const prevMidiSpeedFactor = usePrevious(midiSpeedFactor)

    useEffect(() => {
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

        switch (state) {
            case 'playing':
                setIsStarted(true)
                if (!isStarted) {
                    worker.postMessage({
                        code: 'start',
                        startAt,
                        midiSpeedFactor,
                    })
                }
                break
            case 'stopped':
                setIsStarted(false)
                worker.postMessage({
                    code: 'stopped',
                })
                break
            case 'paused':
                setIsStarted(false)
                worker.postMessage({
                    code: 'paused',
                })
                break
            case 'seeking':
                setIsStarted(false)
                worker.postMessage({
                    code: 'seeking',
                    startAt,
                })
                break
        }
    }, [midiMetas, state, isStarted, midiSpeedFactor, startAt, worker]) // midiMetas is used here to force the visualization to redraw on midiImport

    return null
}
