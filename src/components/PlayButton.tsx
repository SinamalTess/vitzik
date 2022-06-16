import React from 'react'
import { Button } from './generics/Button'

interface PlayerControllerProps {
    onClick: () => void
    isPlaying: boolean
}

export function PlayButton({ onClick, isPlaying }: PlayerControllerProps) {
    return <Button onClick={onClick}> {isPlaying ? 'Pause' : 'Play'} </Button>
}
