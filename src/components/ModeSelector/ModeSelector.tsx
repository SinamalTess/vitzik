import { ButtonGroup } from '../_presentational/ButtonGroup'
import { Button } from '../_presentational/Button'
import React from 'react'
import { AppMode } from '../../types'
import { Tooltip } from '../_presentational/Tooltip'

interface ModeSelectorProps {
    appMode: AppMode
    onChange: (mode: AppMode) => void
}

export function ModeSelector({ onChange, appMode }: ModeSelectorProps) {
    const isLearningMode = appMode === 'learning'

    return (
        <ButtonGroup>
            <Tooltip showOnHover>
                <Button disabled onClick={() => onChange('learning')} active={isLearningMode}>
                    Music theory
                </Button>
                Coming soon...
            </Tooltip>
            <Button onClick={() => onChange('import')} active={!isLearningMode}>
                Import Midi
            </Button>
        </ButtonGroup>
    )
}
