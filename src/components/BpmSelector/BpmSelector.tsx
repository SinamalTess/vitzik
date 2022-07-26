import { Tooltip } from '../_presentational/Tooltip'
import { Button } from '../_presentational/Button'
import { ButtonGroup } from '../_presentational/ButtonGroup'
import React, { useEffect, useState } from 'react'
import { msPerBeatToBeatPerMin } from '../../utils'
import { MsPerBeat } from '../../types'
import './BpmSelector.scss'
import { getMsPerBeatFromTime } from '../MidiVisualizer/MidiVisualizerFactory'

interface BpmSelectorProps {
    worker: Worker
    midiSpeedFactor: number
    allMsPerBeat: MsPerBeat[]
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
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

function getBPM(allMsPerBeat: MsPerBeat[], time: number, midiSpeedFactor: number) {
    const msPerBeat = getMsPerBeatFromTime(allMsPerBeat, time)?.value ?? 0
    return Math.round(msPerBeatToBeatPerMin(msPerBeat) / midiSpeedFactor)
}

export function BpmSelector({
    worker,
    midiSpeedFactor,
    allMsPerBeat,
    onChangeMidiSpeedFactor,
}: BpmSelectorProps) {
    const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false)
    const [bpm, setBpm] = useState(0)
    const speed = SPEED_FACTORS.find(({ factor }) => factor === midiSpeedFactor)?.speed

    useEffect(() => {
        const newBpm = getBPM(allMsPerBeat, 0, midiSpeedFactor)
        setBpm(newBpm)

        function onTimeChange(message: MessageEvent) {
            const { time } = message.data
            const newBpm = getBPM(allMsPerBeat, time, midiSpeedFactor)
            setBpm(newBpm)
        }

        worker.addEventListener('message', onTimeChange)

        return function cleanup() {
            worker.removeEventListener('message', onTimeChange)
        }
    }, [allMsPerBeat, midiSpeedFactor, worker])

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
