import React from 'react'
import { MusicSystem } from '../../types'
import { Button, ButtonGroup } from 'vitzik-ui'

interface MusicSystemSelectorProps {
    musicSystem: MusicSystem
    onChange: (musicSystem: MusicSystem) => void
}

export function MusicSystemSelector({ musicSystem, onChange }: MusicSystemSelectorProps) {
    return (
        <ButtonGroup size={'sm'}>
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
