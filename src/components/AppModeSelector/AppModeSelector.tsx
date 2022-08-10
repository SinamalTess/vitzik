import { ButtonGroup } from '../_presentational/ButtonGroup'
import { Button } from '../_presentational/Button'
import React from 'react'
import { AppMode } from '../../types'
import { Tooltip } from '../_presentational/Tooltip'

interface AppModeSelectorProps {
    appMode: AppMode
    onChange: (mode: AppMode) => void
}

export function AppModeSelector({ onChange, appMode }: AppModeSelectorProps) {
    const isLearningMode = appMode === 'theory'

    return (
        <ButtonGroup>
            <Tooltip showOnHover>
                <Button disabled onClick={() => onChange('theory')} active={isLearningMode}>
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
