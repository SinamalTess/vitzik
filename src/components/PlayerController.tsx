import React, { useEffect, useState } from 'react'
import { Button } from './generics/Button'

interface PlayerControllerProps {
    midiTrackDuration: number
    onPlay: (midiTrackCurrentTime: number) => void
    onPause: () => void
}

export function PlayerController({ onPlay, midiTrackDuration, onPause }: PlayerControllerProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false)

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined
        if (isPlaying) {
            timer = setInterval(() => {
                // @ts-ignore
                onPlay((midiTrackCurrentTime: number) => {
                    if (midiTrackCurrentTime >= midiTrackDuration) {
                        clearInterval(timer)
                        setIsPlaying(false)
                        return 0
                    }
                    return midiTrackCurrentTime + 10
                })
            }, 10)
        } else {
            onPause()
        }
        return () => {
            clearInterval(timer)
            onPause()
        }
    }, [isPlaying])

    function onClick() {
        if (midiTrackDuration) {
            setIsPlaying((isPlaying) => !isPlaying)
        }
    }

    return <Button onClick={onClick}> {isPlaying ? 'Pause' : 'Play'} </Button>
}
