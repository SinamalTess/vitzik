import { ButtonGroup } from './generics/ButtonGroup'
import { Button } from './generics/Button'
import React from 'react'

export type AppMode = 'learning' | 'import'

interface ModeSelectorProps {
    onChangeAppMode: (mode: AppMode) => void
    appMode: AppMode
}

export function ModeSelector({ onChangeAppMode, appMode }: ModeSelectorProps) {
    const isLearningMode = appMode === 'learning'

    return (
        <ButtonGroup>
            <Button onClick={() => onChangeAppMode('learning')} active={isLearningMode}>
                Learning
            </Button>
            <Button onClick={() => onChangeAppMode('import')} active={!isLearningMode}>
                Import Midi
            </Button>
        </ButtonGroup>
    )
}
