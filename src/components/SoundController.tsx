import React from 'react'
import { Button } from './generics/Button'

interface SoundControllerProps {
    isMute: boolean
    onToggleSound: (isSoundOn: boolean) => void
}

export function SoundController({ isMute, onToggleSound }: SoundControllerProps) {
    function handleClick() {
        onToggleSound(!isMute)
    }

    return <Button onClick={handleClick} icon="volume" active={!isMute}></Button>
}
