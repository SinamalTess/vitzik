// @ts-ignore
import { ButtonGroup, Tooltip, Button } from 'vitzik-ui'
import React from 'react'
import { AppMode } from '../../types'

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
