import React from 'react'
import { MusicSystem } from '../types'
import { ButtonGroup } from './generics/ButtonGroup'
import { Button } from './generics/Button'

interface MusicSystemSelectorProps {
    musicSystem: MusicSystem
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
}

export function MusicSystemSelector({
    musicSystem,
    onChangeMusicSystem,
}: MusicSystemSelectorProps) {
    return (
        <ButtonGroup>
            <Button
                onClick={() => onChangeMusicSystem('syllabic')}
                active={musicSystem === 'syllabic'}
            >
                Syllabic
            </Button>
            <Button
                onClick={() => onChangeMusicSystem('alphabetical')}
                active={musicSystem === 'alphabetical'}
            >
                Alphabetical
            </Button>
            <Button onClick={() => onChangeMusicSystem('german')} active={musicSystem === 'german'}>
                German
            </Button>
        </ButtonGroup>
    )
}
