import { Button } from '../_presentational/Button'
import { PlayButton } from '../PlayButton'
import { SoundButton } from '../SoundButton'
import { Tooltip } from '../_presentational/Tooltip'
import { BpmSelector } from '../BpmSelector'
import React from 'react'
import { AudioPlayerState, MidiMetas } from '../../types'

interface ControlsProps {
    isEditingLoop: boolean
    isMute: boolean
    audioPlayerState: AudioPlayerState
    midiSpeedFactor: number
    midiMetas: MidiMetas
    onClickOnPlay: () => void
    onStop: () => void
    onClickOnLoop: () => void
    onMute: (isMute: boolean) => void
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
    onChangeMidiStartingTime: React.Dispatch<React.SetStateAction<number>>
}

export function Controls({
    isEditingLoop,
    isMute,
    midiSpeedFactor,
    audioPlayerState,
    midiMetas,
    onClickOnPlay,
    onStop,
    onMute,
    onChangeMidiSpeedFactor,
    onChangeMidiStartingTime,
    onClickOnLoop,
}: ControlsProps) {
    return (
        <>
            <Button onClick={onStop} icon="stop" variant="link" color="secondary" />
            <PlayButton onClick={onClickOnPlay} isPlaying={audioPlayerState === 'playing'} />
            <SoundButton isMute={isMute} onMute={onMute} />
            <Tooltip showOnHover>
                <Button icon={'loop'} onClick={onClickOnLoop}>
                    {isEditingLoop ? 'clear' : ''}
                </Button>
                Loop over a range of time
            </Tooltip>
            <BpmSelector
                midiSpeedFactor={midiSpeedFactor}
                onChangeMidiSpeedFactor={onChangeMidiSpeedFactor}
                onChangeMidiStartingTime={onChangeMidiStartingTime}
                midiMetas={midiMetas}
            />
        </>
    )
}
