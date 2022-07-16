import { Divider } from '../_presentational/Divider'
import { Tooltip } from '../_presentational/Tooltip'
import { Button } from '../_presentational/Button'
import { ButtonGroup } from '../_presentational/ButtonGroup'
import React, { useContext, useState } from 'react'
import { msPerBeatToBeatPerMin } from '../../utils'
import { MidiMetas } from '../../types'
import { MidiCurrentTime } from '../TimeContextProvider/TimeContextProvider'
import './BpmSelectors.scss'
import { getMsPerBeatFromTime } from '../Visualizer/MidiVisualizerCoordinates'

interface BpmSelectorProps {
    midiSpeedFactor: number
    midiMetas: MidiMetas
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
    onChangeMidiStartingTime: React.Dispatch<React.SetStateAction<number>>
}

export function BpmSelector({
    midiSpeedFactor,
    midiMetas,
    onChangeMidiSpeedFactor,
    onChangeMidiStartingTime,
}: BpmSelectorProps) {
    const midiCurrentTime = useContext(MidiCurrentTime)
    const [isBPMTooltipOpen, setIsBPMTooltipOpen] = useState<boolean>(false)
    const { allMsPerBeat } = midiMetas
    const msPerBeat = getMsPerBeatFromTime(allMsPerBeat, midiCurrentTime)?.value ?? 0

    function handleChangeMidiSpeedFactor(value: number) {
        onChangeMidiSpeedFactor(value)
        onChangeMidiStartingTime(midiCurrentTime)
    }

    function handleClickBPM() {
        setIsBPMTooltipOpen((isBPMTooltipOpen) => !isBPMTooltipOpen)
    }

    function onShowTooltip() {
        setIsBPMTooltipOpen(true)
    }

    function onHideTooltip() {
        setIsBPMTooltipOpen(false)
    }

    const speedFactors = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    const actualBpm = Math.round(msPerBeatToBeatPerMin(msPerBeat) / midiSpeedFactor)
    return (
        <span className="bpm-selector">
            <Divider orientation="vertical" />
            <Tooltip show={isBPMTooltipOpen} onHide={onHideTooltip} onShow={onShowTooltip}>
                <span>
                    <span> BPM {midiSpeedFactor !== 1 ? `(x${midiSpeedFactor})` : null} : </span>
                    <Button onClick={handleClickBPM}> {actualBpm}</Button>
                </span>
                <span className="bpm-selector__value">
                    <ButtonGroup size={'sm'}>
                        {speedFactors.map((factor, index) => (
                            <Button
                                key={factor}
                                active={factor === midiSpeedFactor}
                                onClick={() => {
                                    handleChangeMidiSpeedFactor(factor)
                                }}
                            >
                                x{speedFactors[index]}
                            </Button>
                        ))}
                    </ButtonGroup>
                </span>
            </Tooltip>
            <Divider orientation="vertical" />
        </span>
    )
}