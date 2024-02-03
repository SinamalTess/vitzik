import React from 'react'
import { MusicSystem } from '@/types'
import { Button, ButtonGroup } from 'vitzik-ui'

interface MusicSystemSelectorProps {
    musicSystem: MusicSystem
    onChange: (musicSystem: MusicSystem) => void
}

export function MusicSystemSelector({ musicSystem, onChange }: MusicSystemSelectorProps) {
    return (
        <ButtonGroup size={'sm'}>
            <Button
                onClick={() => onChange('syllabic')}
                color={musicSystem === 'syllabic' ? 'primary' : 'secondary'}
            >
                Syllabic
            </Button>
            <Button
                onClick={() => onChange('alphabetical')}
                color={musicSystem === 'alphabetical' ? 'primary' : 'secondary'}
            >
                Alphabetical
            </Button>
            <Button
                onClick={() => onChange('german')}
                color={musicSystem === 'german' ? 'primary' : 'secondary'}
            >
                German
            </Button>
        </ButtonGroup>
    )
}
