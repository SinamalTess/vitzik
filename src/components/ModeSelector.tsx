import { ButtonGroup } from './generics/ButtonGroup'
import { Button } from './generics/Button'
import React from 'react'

export type AppMode = 'learning' | 'import'

interface ModeSelectorProps {
    appMode: AppMode
    onChange: (mode: AppMode) => void
}

export function ModeSelector({ onChange, appMode }: ModeSelectorProps) {
    const isLearningMode = appMode === 'learning'

    return (
        <ButtonGroup>
            <Button onClick={() => onChange('learning')} active={isLearningMode}>
                Learning
            </Button>
            <Button onClick={() => onChange('import')} active={!isLearningMode}>
                Import Midi
            </Button>
        </ButtonGroup>
    )
}
