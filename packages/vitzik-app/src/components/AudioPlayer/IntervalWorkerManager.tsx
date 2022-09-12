import { useEffect, useState } from 'react'
import { AudioPlayerState, MidiMetas } from '../../types'
import { useIntervalWorker, usePrevious } from '../../hooks'

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
    const { intervalWorker } = useIntervalWorker()

    useEffect(() => {
        if (prevMidiSpeedFactor !== midiSpeedFactor) {
            intervalWorker?.restart(startAt, midiSpeedFactor)
        }

        switch (playerState) {
            case 'playing':
                setIsStarted(true)
                if (!isStarted) {
                    intervalWorker?.start(startAt, midiSpeedFactor)
                }
                break
            case 'stopped':
                setIsStarted(false)
                intervalWorker?.stop()
                break
            case 'paused':
                setIsStarted(false)
                intervalWorker?.pause()
                break
            case 'seeking':
                setIsStarted(false)
                intervalWorker?.updateTimer(startAt)
                break
        }
    }, [midiMetas, playerState, isStarted, midiSpeedFactor, startAt, intervalWorker]) // midiMetas is used here to force the visualization to redraw on midiImport

    return null
}
