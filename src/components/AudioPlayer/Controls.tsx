import { Button } from '../_presentational/Button'
import { PlayButton } from '../PlayButton'
import { SoundButton } from '../SoundButton'
import { Tooltip } from '../_presentational/Tooltip'
import { BpmSelector } from '../BpmSelector'
import React from 'react'
import { AudioPlayerState, MsPerBeat } from '../../types'
import { Divider } from '../_presentational/Divider'

interface ControlsProps {
    worker: Worker
    isEditingLoop: boolean
    isMute: boolean
    audioPlayerState: AudioPlayerState
    midiSpeedFactor: number
    allMsPerBeat: MsPerBeat[]
    onClickOnPlay: () => void
    onStop: () => void
    onClickOnLoop: () => void
    onMute: (isMute: boolean) => void
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
}

export function Controls({
    worker,
    isEditingLoop,
    isMute,
    midiSpeedFactor,
    audioPlayerState,
    allMsPerBeat,
    onClickOnPlay,
    onStop,
    onMute,
    onChangeMidiSpeedFactor,
    onClickOnLoop,
}: ControlsProps) {
    return (
        <>
            <Button onClick={onStop} icon="stop" variant="link" color="secondary" />
            <PlayButton onClick={onClickOnPlay} isPlaying={audioPlayerState === 'playing'} />
            <SoundButton isMute={isMute} onMute={onMute} />
            <Tooltip showOnHover>
                <Button
                    icon={'loop'}
                    onClick={onClickOnLoop}
                    variant="link"
                    color={isEditingLoop ? 'primary' : 'secondary'}
                >
                    {isEditingLoop ? 'clear' : ''}
                </Button>
                Loop over a range of time
            </Tooltip>
            <Divider orientation="vertical" />
            <BpmSelector
                worker={worker}
                midiSpeedFactor={midiSpeedFactor}
                onChangeMidiSpeedFactor={onChangeMidiSpeedFactor}
                allMsPerBeat={allMsPerBeat}
            />
            <Divider orientation="vertical" />
        </>
    )
}
