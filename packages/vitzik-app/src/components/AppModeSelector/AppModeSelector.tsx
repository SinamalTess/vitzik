import { ButtonGroup, Tooltip, Button } from 'vitzik-ui'
import React from 'react'
import { AppMode } from '@/types'

interface AppModeSelectorProps {
    appMode: AppMode
    onChange: (mode: AppMode) => void
}

export function AppModeSelector({ onChange, appMode }: AppModeSelectorProps) {
    const isLearningMode = appMode === 'theory'

    return (
        <ButtonGroup>
            <Tooltip showOnHover>
                <span>
                    <Button
                        disabled
                        onClick={() => onChange('theory')}
                        color={isLearningMode ? 'primary' : 'secondary'}
                    >
                        Music theory
                    </Button>
                </span>
                Coming soon...
            </Tooltip>
            <Button
                onClick={() => onChange('import')}
                color={!isLearningMode ? 'primary' : 'secondary'}
            >
                Import Midi
            </Button>
        </ButtonGroup>
    )
}
