import { Tooltip } from '../_presentational/Tooltip'
import { Button } from '../_presentational/Button'
import { ButtonGroup } from '../_presentational/ButtonGroup'
import React, { useContext, useState } from 'react'
import { msPerBeatToBeatPerMin } from '../../utils'
import { MsPerBeat } from '../../types'
import { MidiCurrentTime } from '../TimeContextProvider/TimeContextProvider'
import './BpmSelector.scss'
import { getMsPerBeatFromTime } from '../Visualizer/MidiVisualizerCoordinates'

interface BpmSelectorProps {
    midiSpeedFactor: number
    allMsPerBeat: MsPerBeat[]
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
    onChangeMidiStartingTime: React.Dispatch<React.SetStateAction<number>>
}

const BASE_CLASS = 'bpm-selector'
const SPEED_FACTORS = [
    {
        factor: 2, // The factor used to divide the BPM
        speed: 0.5, // The resulting speed. (Fewer beats per minute = higher speed)
    },
    {
        factor: 1.25,
        speed: 0.75,
    },
    {
        factor: 1,
        speed: 1,
    },
    {
        factor: 0.75,
        speed: 1.5,
    },
    {
        factor: 0.5,
        speed: 2,
    },
]

export function BpmSelector({
    midiSpeedFactor,
    allMsPerBeat,
    onChangeMidiSpeedFactor,
    onChangeMidiStartingTime,
}: BpmSelectorProps) {
    const midiCurrentTime = useContext(MidiCurrentTime)
    const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false)
    const msPerBeat = getMsPerBeatFromTime(allMsPerBeat, midiCurrentTime)?.value ?? 0
    const bpm = Math.round(msPerBeatToBeatPerMin(msPerBeat) / midiSpeedFactor)
    const speed = SPEED_FACTORS.find(({ factor }) => factor === midiSpeedFactor)?.speed

    function handleChange(value: number) {
        onChangeMidiSpeedFactor(value)
        onChangeMidiStartingTime(midiCurrentTime)
    }

    function handleClick() {
        setIsTooltipOpen((isOpen) => !isOpen)
    }

    function onShowTooltip() {
        setIsTooltipOpen(true)
    }

    function onHideTooltip() {
        setIsTooltipOpen(false)
    }

    return (
        <span className={BASE_CLASS}>
            <span> BPM {midiSpeedFactor !== 1 ? `(x${speed})` : null}</span>
            <Tooltip show={isTooltipOpen} onHide={onHideTooltip} onShow={onShowTooltip}>
                <Button onClick={handleClick}> {bpm}</Button>
                <span className={`${BASE_CLASS}__value`}>
                    Speed
                    <ButtonGroup size={'sm'}>
                        {SPEED_FACTORS.map(({ factor, speed }) => (
                            <Button
                                key={factor}
                                active={factor === midiSpeedFactor}
                                onClick={() => handleChange(factor)}
                            >
                                x{speed}
                            </Button>
                        ))}
                    </ButtonGroup>
                </span>
            </Tooltip>
        </span>
    )
}
