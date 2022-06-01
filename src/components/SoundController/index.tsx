import React from 'react'
import { Button } from '../generics/Button'

interface SoundControllerProps {
    isSoundOn: boolean
    toggleSound: (isSoundOn: boolean) => void
}

export function SoundController({
    isSoundOn,
    toggleSound,
}: SoundControllerProps) {
    return (
        <Button onClick={() => toggleSound(!isSoundOn)} icon="volume"></Button>
    )
}
