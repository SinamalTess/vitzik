import React from 'react'

interface SoundControllerProps {
    isSoundOn: boolean
    toggleSound: (isSoundOn: boolean) => void
}

export function SoundController({
    isSoundOn,
    toggleSound,
}: SoundControllerProps) {
    return (
        <button onClick={() => toggleSound(!isSoundOn)}>
            Sound {isSoundOn ? 'On' : 'Off'}
        </button>
    )
}
