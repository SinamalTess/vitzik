import React from 'react'
import { Button } from './generics/Button'

interface SoundControllerProps {
    isMute: boolean
    toggleSound: (isSoundOn: boolean) => void
}

export function SoundController({ isMute, toggleSound }: SoundControllerProps) {
    return <Button onClick={() => toggleSound(!isMute)} icon="volume" active={!isMute}></Button>
}
