import React from 'react'
import { MusicSystem } from '../../types'
import { ButtonGroup } from '../_presentational/ButtonGroup'
import { Button } from '../_presentational/Button'

interface MusicSystemSelectorProps {
    musicSystem: MusicSystem
    onChange: (musicSystem: MusicSystem) => void
}

export function MusicSystemSelector({ musicSystem, onChange }: MusicSystemSelectorProps) {
    return (
        <ButtonGroup>
            <Button onClick={() => onChange('syllabic')} active={musicSystem === 'syllabic'}>
                Syllabic
            </Button>
            <Button
                onClick={() => onChange('alphabetical')}
                active={musicSystem === 'alphabetical'}
            >
                Alphabetical
            </Button>
            <Button onClick={() => onChange('german')} active={musicSystem === 'german'}>
                German
            </Button>
        </ButtonGroup>
    )
}
