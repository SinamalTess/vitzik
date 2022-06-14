import React from 'react'
import { MusicSystem } from '../types'
import { ButtonGroup } from './generics/ButtonGroup'
import { Button } from './generics/Button'

interface MusicSystemSelectorProps {
    musicSystem: MusicSystem
    onChange: (musicSystem: MusicSystem) => void
}

export function MusicSystemSelector({ musicSystem, onChange }: MusicSystemSelectorProps) {
    return (
        <ButtonGroup>
            <Button onClick={() => onChange('syllabic')} active={musicSystem === 'syllabic'}>
                Si
            </Button>
            <Button
                onClick={() => onChange('alphabetical')}
                active={musicSystem === 'alphabetical'}
            >
                B
            </Button>
            <Button onClick={() => onChange('german')} active={musicSystem === 'german'}>
                H
            </Button>
        </ButtonGroup>
    )
}
