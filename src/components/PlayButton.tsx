import React, { useEffect, useState } from 'react'
import { Button } from './generics/Button'
import workerInterval from '../workers/workerInterval'

interface PlayerControllerProps {
    midiTrackDuration: number
    onPlay: any // TODO: fix this
    onPause: () => void
}

function WebWorker(worker: any): Worker {
    const code = worker.toString()
    const blob = new Blob(['(' + code + ')()'])
    return new Worker(URL.createObjectURL(blob))
}

export function PlayButton({ onPlay, midiTrackDuration, onPause }: PlayerControllerProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    let worker: Worker

    useEffect(() => {
        if (isPlaying) {
            startWorker()
        } else {
            worker?.terminate()
            onPause()
        }
        return () => {
            worker?.terminate()
            onPause()
        }
    }, [isPlaying])

    function startWorker() {
        worker = WebWorker(workerInterval)
        worker.onmessage = (message) => {
            const interval = message.data.interval
            const setMidiTrackCurrentTime = onPlay()
            setMidiTrackCurrentTime(
                (midiTrackCurrentTime: number) => midiTrackCurrentTime + interval
            )
        }
    }

    function onClick() {
        if (midiTrackDuration) {
            setIsPlaying((isPlaying) => !isPlaying)
        }
    }

    return <Button onClick={onClick}> {isPlaying ? 'Pause' : 'Play'} </Button>
}
