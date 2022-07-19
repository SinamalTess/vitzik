import { Tooltip } from '../_presentational/Tooltip'
import { RangeSlider } from '../_presentational/RangeSlider'
import React, { useContext } from 'react'
import { msToTime, normalizeTitle } from '../../utils'
import { MidiCurrentTime } from '../TimeContextProvider/TimeContextProvider'

const BASE_CLASS = 'audio-player'

interface ProgressBarProps {
    midiDuration: number
    midiTitle?: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onMouseDown: () => void
    onMouseUp: () => void
}

export function ProgressBar({
    midiDuration,
    midiTitle,
    onChange,
    onMouseDown,
    onMouseUp,
}: ProgressBarProps) {
    const midiCurrentTime = useContext(MidiCurrentTime)
    const currentTime = msToTime(midiCurrentTime)
    const totalTime = msToTime(midiDuration)
    const title = normalizeTitle(midiTitle ?? '')
    return (
        <>
            <Tooltip showOnHover>
                <span className={`${BASE_CLASS}__track-title`}>{title}</span>
                {title}
            </Tooltip>
            <span className={`${BASE_CLASS}__current-time`} role="timer">
                {currentTime}
            </span>
            <RangeSlider
                className={`${BASE_CLASS}__progress-bar`}
                value={midiCurrentTime}
                max={midiDuration}
                onChange={onChange}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
            />
            <span className={`${BASE_CLASS}__total-time`} role="timer">
                {totalTime}
            </span>
        </>
    )
}
