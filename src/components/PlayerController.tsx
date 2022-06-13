import React, { useEffect, useState } from 'react'
import { Button } from './generics/Button'

interface PlayerControllerProps {
    midiTrackDuration: number
    setMidiTrackCurrentTime: React.Dispatch<React.SetStateAction<number>>
}

export function PlayerController({
    setMidiTrackCurrentTime,
    midiTrackDuration,
}: PlayerControllerProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false)

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined
        if (isPlaying) {
            timer = setInterval(() => {
                setMidiTrackCurrentTime((midiTrackCurrentTime: number) => {
                    if (midiTrackCurrentTime >= midiTrackDuration) {
                        clearInterval(timer)
                        setIsPlaying(false)
                        return 0
                    }
                    return midiTrackCurrentTime + 10
                })
            }, 10)
        }
        return () => {
            clearInterval(timer)
        }
    }, [isPlaying])

    function onClick() {
        if (midiTrackDuration) {
            setIsPlaying((isPlaying) => !isPlaying)
        }
    }

    return <Button onClick={onClick}> {isPlaying ? 'Pause' : 'Play'} </Button>
}
