import { Tooltip } from '../_presentational/Tooltip'
import { RangeSlider } from '../_presentational/RangeSlider'
import React, { useEffect, useRef } from 'react'
import { msToTime, normalizeTitle } from '../../utils'
import { LoopTimes } from '../../types/LoopTimes'
import './ProgressBar.scss'

interface PreviewLoopProps {
    duration: number
    refProgressBar: React.RefObject<HTMLInputElement>
    loopTimes: LoopTimes
}

const PreviewLoop = ({ duration, refProgressBar, loopTimes }: PreviewLoopProps) => {
    const [startLoop, endLoop] = loopTimes

    if (!startLoop || !refProgressBar.current) return null

    const left = getX(startLoop)
    const width = endLoop ? getX(endLoop) - left : 0

    function getX(time: number) {
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
                    {`start loop: ${msToTime(startLoop)}`}
                    <br />
                    {endLoop ? `end loop: ${msToTime(endLoop)}` : null}
                </>
            ) : null}
        </Tooltip>
    )
}

const BASE_CLASS = 'progress-bar'

interface ProgressBarProps {
    worker: Worker
    duration: number
    title?: string
    loopTimes?: LoopTimes
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onMouseDown: (event: React.MouseEvent<HTMLInputElement>) => void
    onMouseUp: (event: React.MouseEvent<HTMLInputElement>) => void
}

export function ProgressBar({
    worker,
    duration,
    title,
    loopTimes,
    onChange,
    onMouseDown,
    onMouseUp,
}: ProgressBarProps) {
    const refTime = useRef<HTMLSpanElement>(null)
    const refBar = useRef<HTMLInputElement>(null)
    const totalTime = msToTime(duration)
    const titleWithoutExtension = normalizeTitle(title ?? '')

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
                    {loopTimes ? (
                        <PreviewLoop
                            loopTimes={loopTimes}
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
