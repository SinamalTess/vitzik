import React from 'react'
import { MusicSystem } from '../../types'
import { ButtonGroup } from '../generics/ButtonGroup'
import { Button } from '../generics/Button'

interface MusicSystemSelectorProps {
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
}

export function MusicSystemSelector({
    onChangeMusicSystem,
}: MusicSystemSelectorProps) {
    return (
        <ButtonGroup>
            <Button onClick={() => onChangeMusicSystem('syllabic')}>
                Syllabic
            </Button>
            <Button onClick={() => onChangeMusicSystem('alphabetical')}>
                Alphabetical
            </Button>
            <Button onClick={() => onChangeMusicSystem('german')}>
                German
            </Button>
        </ButtonGroup>
    )
}
