import { ButtonGroup } from '../generics/ButtonGroup'
import { Button } from '../generics/Button'
import React from 'react'

export type AppMode = 'learning' | 'import'

interface ModeSelectorProps {
    onChangeAppMode: (mode: AppMode) => void
}

export function ModeSelector({ onChangeAppMode }: ModeSelectorProps) {
    return (
        <ButtonGroup>
            <Button onClick={() => onChangeAppMode('learning')}>
                Learning
            </Button>
            <Button onClick={() => onChangeAppMode('import')}>
                Import Midi
            </Button>
        </ButtonGroup>
    )
}
