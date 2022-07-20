import { Tooltip } from '../_presentational/Tooltip'
import { RangeSlider } from '../_presentational/RangeSlider'
import React, { useEffect, useRef } from 'react'
import { msToTime, normalizeTitle } from '../../utils'

const BASE_CLASS = 'audio-player'

interface ProgressBarProps {
    worker: Worker
    duration: number
    title?: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onMouseDown: (event: React.MouseEvent<HTMLInputElement>) => void
    onMouseUp: (event: React.MouseEvent<HTMLInputElement>) => void
}

export function ProgressBar({
    worker,
    duration,
    title,
    onChange,
    onMouseDown,
    onMouseUp,
}: ProgressBarProps) {
    const refTime = useRef<HTMLSpanElement>(null)
    const refBar = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (refTime.current && refBar.current) {
            refTime.current.innerText = msToTime(0)
            refBar.current.value = '0'
        }
        function onTimeChange(message: MessageEvent) {
            const { time } = message.data
            const readableTime = msToTime(time)
            if (refTime.current && refBar.current) {
                refTime.current.innerText = readableTime
                refBar.current.value = time
            }
        }
        worker.addEventListener('message', onTimeChange)
        return function cleanup() {
            worker.removeEventListener('message', onTimeChange)
        }
    }, [])

    const totalTime = msToTime(duration)
    const titleWithoutExtension = normalizeTitle(title ?? '')
    return (
        <>
            {title ? (
                <Tooltip showOnHover>
                    <span className={`${BASE_CLASS}__track-title`}>{titleWithoutExtension}</span>
                    {titleWithoutExtension}
                </Tooltip>
            ) : null}
            <span className={`${BASE_CLASS}__current-time`} role="timer" ref={refTime} />
            <RangeSlider
                ref={refBar}
                className={`${BASE_CLASS}__progress-bar`}
                max={duration}
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
