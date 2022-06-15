import React from 'react'
import { Button } from './generics/Button'

interface SoundControllerProps {
    isMute: boolean
    onToggleSound: (isSoundOn: boolean) => void
}

export function SoundController({ isMute, onToggleSound }: SoundControllerProps) {
    return <Button onClick={() => onToggleSound(!isMute)} icon="volume" active={!isMute}></Button>
}
