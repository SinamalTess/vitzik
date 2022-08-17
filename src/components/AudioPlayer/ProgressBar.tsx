import { Tooltip } from '../_presentational/Tooltip'
import { RangeSlider } from '../_presentational/RangeSlider'
import React, { useEffect, useRef } from 'react'
import { msToHumanReadableTime, normalizeMidiTitle } from '../../utils'
import { LoopTimestamps } from '../../types'
import './ProgressBar.scss'
import { useIntervalWorker } from '../../_hooks/useIntervalWorker'

interface PreviewLoopProps {
    duration: number
    refProgressBar: React.RefObject<HTMLInputElement>
    loopTimestamps: LoopTimestamps
}

const LoopPreview = ({ duration, refProgressBar, loopTimestamps }: PreviewLoopProps) => {
    const [startLoop, endLoop] = loopTimestamps

    if (!startLoop || !refProgressBar.current) return null

    const left = getXPosition(startLoop)
    const width = endLoop ? getXPosition(endLoop) - left : 0

    function getXPosition(time: number) {
        const { clientWidth } = refProgressBar.current as HTMLInputElement
        const ratio = duration / clientWidth
        return time / ratio
    }

    return (
        <Tooltip showOnHover>
            <span
                className={`${BASE_CLASS}__loop-preview`}
                style={{
                    left,
                    width,
                }}
            ></span>
            {startLoop ? (
                <>
                    {`start loop: ${msToHumanReadableTime(startLoop)}`}
                    <br />
                    {endLoop ? `end loop: ${msToHumanReadableTime(endLoop)}` : null}
                </>
            ) : null}
        </Tooltip>
    )
}

const BASE_CLASS = 'progress-bar'

interface ProgressBarProps {
    duration: number
    title?: string
    loopTimestamps?: LoopTimestamps
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onMouseDown: (event: React.MouseEvent<HTMLInputElement>) => void
    onMouseUp: (event: React.MouseEvent<HTMLInputElement>) => void
}

export function ProgressBar({
    duration,
    title,
    loopTimestamps,
    onChange,
    onMouseDown,
    onMouseUp,
}: ProgressBarProps) {
    const refTime = useRef<HTMLSpanElement>(null)
    const refBar = useRef<HTMLInputElement>(null)
    const totalTime = msToHumanReadableTime(duration)
    const titleWithoutExtension = normalizeMidiTitle(title ?? '')

    useIntervalWorker(onTimeChange)

    function onTimeChange(time: number) {
        const readableTime = msToHumanReadableTime(time)
        if (refTime.current && refBar.current) {
            refTime.current.innerText = readableTime
            refBar.current.value = time.toString()
        }
    }

    useEffect(() => {
        if (refTime.current && refBar.current) {
            refTime.current.innerText = msToHumanReadableTime(0)
            refBar.current.value = '0'
        }
    }, [])

    return (
        <span className={BASE_CLASS}>
            {title ? (
                <Tooltip showOnHover>
                    <span className={`${BASE_CLASS}__track-title`}>{titleWithoutExtension}</span>
                    {titleWithoutExtension}
                </Tooltip>
            ) : null}
            <span className={`${BASE_CLASS}__current-time`} role="timer" ref={refTime} />
            <span className={`${BASE_CLASS}__preview`}>
                <>
                    <RangeSlider
                        ref={refBar}
                        max={duration}
                        onChange={onChange}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                    />
                    {loopTimestamps ? (
                        <LoopPreview
                            loopTimestamps={loopTimestamps}
                            duration={duration}
                            refProgressBar={refBar}
                        />
                    ) : null}
                </>
            </span>
            <span className={`${BASE_CLASS}__total-time`} role="timer">
                {totalTime}
            </span>
        </span>
    )
}
