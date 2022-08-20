import { Tooltip, Button, ButtonGroup } from 'vitzik-ui'
import React, { useEffect, useState } from 'react'
import { MsPerBeat } from '../../types'
import './BpmSelector.scss'
import { useIntervalWorker } from '../../hooks/useIntervalWorker'
import { MidiFactory } from '../../utils'
import findLast from "lodash/findLast";

interface BpmSelectorProps {
    midiSpeedFactor: number
    allMsPerBeat: MsPerBeat[]
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
}

const BASE_CLASS = 'bpm-selector'
const SPEED_FACTORS = [
    {
        factor: 2, // The factor used to divide the Bpm
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

function getMsPerBeatFromTime (allMsPerBeat: MsPerBeat[], time: number) {
    return (
        findLast(allMsPerBeat, (msPerBeat) => msPerBeat.timestamp <= time) ??
        allMsPerBeat.find((msPerBeat) => msPerBeat.timestamp >= time)
    )
}

function getBpmFromTime(allMsPerBeat: MsPerBeat[], time: number, midiSpeedFactor: number) {
    const msPerBeat = getMsPerBeatFromTime(allMsPerBeat, time)?.value ?? 0
    const bpm = MidiFactory.Time().msPerBeatToBpm(msPerBeat)
    return Math.round(bpm / midiSpeedFactor)
}

export function BpmSelector({
    midiSpeedFactor,
    allMsPerBeat,
    onChangeMidiSpeedFactor,
}: BpmSelectorProps) {
    const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false)
    const speedFactor = SPEED_FACTORS.find(({ factor }) => factor === midiSpeedFactor)
    const speed = speedFactor ? speedFactor.speed : 1
    const [bpm, setBpm] = useState(0)

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number) {
        const newBpm = getBpmFromTime(allMsPerBeat, time, midiSpeedFactor)
        setBpm(newBpm)
    }

    useEffect(() => {
        const newBpm = getBpmFromTime(allMsPerBeat, 0, midiSpeedFactor)
        setBpm(newBpm)
    }, [midiSpeedFactor])

    function handleChange(value: number) {
        onChangeMidiSpeedFactor(value)
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
                <Button onClick={handleClick} aria-label={'beats per minute'}>
                    {bpm}
                </Button>
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
