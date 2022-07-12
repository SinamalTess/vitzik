import { ButtonGroup } from '../_presentational/ButtonGroup'
import { Button } from '../_presentational/Button'
import React from 'react'
import { AppMode } from '../../types'

interface ModeSelectorProps {
    appMode: AppMode
    onChange: (mode: AppMode) => void
}

export function ModeSelector({ onChange, appMode }: ModeSelectorProps) {
    const isLearningMode = appMode === 'learning'

    return (
        <ButtonGroup>
            <Button disabled onClick={() => onChange('learning')} active={isLearningMode}>
                Learning
            </Button>
            <Button onClick={() => onChange('import')} active={!isLearningMode}>
                Import Midi
            </Button>
        </ButtonGroup>
    )
}
