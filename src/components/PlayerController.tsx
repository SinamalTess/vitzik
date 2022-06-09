import React, { useState } from 'react'
import { Button } from './generics/Button'

interface PlayerControllerProps {
    midiTrackDuration: number
    setTrackPosition: React.Dispatch<React.SetStateAction<number>>
}

export function PlayerController({ setTrackPosition, midiTrackDuration }: PlayerControllerProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false)

    React.useEffect(() => {
        let timer: NodeJS.Timeout | undefined
        if (isPlaying) {
            timer = setInterval(() => {
                setTrackPosition((trackPosition: number) => {
                    if (trackPosition >= midiTrackDuration) {
                        clearInterval(timer)
                        setIsPlaying(false)
                        return 0
                    }
                    return trackPosition + 10
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
