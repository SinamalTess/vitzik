import React from 'react'
import { Button } from './generics/Button'

interface PlayerControllerProps {
    onPlay: () => void
}

export function PlayerController({ onPlay }: PlayerControllerProps) {
    return <Button onClick={onPlay}> Play </Button>
}
