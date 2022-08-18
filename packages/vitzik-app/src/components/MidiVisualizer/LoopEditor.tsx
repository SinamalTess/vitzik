import React, { useContext, useEffect, useState } from 'react'
import './LoopEditor.scss'
import { LoopTimestamps } from '../../types'
import { msToHumanReadableTime } from '../../utils'
import { SVGLine } from 'vitzik-ui'
import { useIntervalWorker } from '../../hooks/useIntervalWorker'
import { AppContext } from '../_contexts'

interface LineProps {
    y: number
    width: number
    timestamp: number
    color?: string
    'data-testid'?: string
}

function LoopLine({ y, width, timestamp, color = 'red' }: LineProps) {
    const yText = y + 20
    return (
        <>
            <SVGLine x1={0} y1={y} x2={width} color={color} aria-label={'loop-line'} />
            <text x="20" y={yText} className="small" fill={color} aria-label={'loop-line-text'}>
                {msToHumanReadableTime(timestamp, true)}
            </text>
        </>
    )
}

export const BASE_CLASS = 'loop-editor'

interface LoopEditorProps {
    loopTimestamps: LoopTimestamps
    height: number
    width: number
    msPerSection: number
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
}

export function LoopEditor({
    loopTimestamps,
    height,
    width,
    msPerSection,
    onChangeLoopTimestamps,
}: LoopEditorProps) {
    const ratio = height / msPerSection
    const allLinesDrawn = !loopTimestamps.includes(null)
    const [previewLineY, setPreviewLineY] = useState(0)
    const { intervalWorker } = useContext(AppContext)
    const [loopStartTimestamp, loopEndTimestamp] = loopTimestamps
    const [time, setTime] = useState(0)
    const yToTimestamp = (y: number) => (height - y) / ratio + time
    const timestampToY = (timestamp: number) => height - (timestamp - time) * ratio

    useIntervalWorker(setTime)

    useEffect(() => {
        intervalWorker?.postMessage({
            code: 'getTime',
        })
    }, [])

    useEffect(() => {
        if (allLinesDrawn) {
            setPreviewLineY(0)
        }
    }, [allLinesDrawn])

    function handleMouseMove(event: React.MouseEvent<SVGElement>) {
        const y = event.clientY - 40
        const timestamp = yToTimestamp(y)
        if (loopStartTimestamp) {
            if (timestamp > loopStartTimestamp) {
                setPreviewLineY(y)
            }
        } else {
            setPreviewLineY(y)
        }
    }

    function handleClick(event: React.MouseEvent<SVGElement>) {
        const y = event.clientY - 40
        const timestamp = yToTimestamp(y)
        onChangeLoopTimestamps((loopTimestamps) => {
            const [startLoop, endLoop] = loopTimestamps
            if (startLoop === null) {
                return [timestamp, endLoop]
            } else if (endLoop === null && timestamp > startLoop) {
                return [startLoop, timestamp]
            } else {
                return loopTimestamps
            }
        })
    }

    const lineTimestamps = loopTimestamps.filter(
        (timestamp) => timestamp && timestamp > time && timestamp < time + msPerSection
    ) as number[]

    const props = {
        onMouseMove: handleMouseMove,
        onClick: handleClick,
    }

    return (
        <svg
            height={height}
            width="100%"
            className={BASE_CLASS}
            data-testid={'loop-editor'}
            {...(allLinesDrawn ? null : props)}
        >
            {lineTimestamps.length
                ? lineTimestamps.map((timestamp) => {
                      const y = timestampToY(timestamp)
                      return <LoopLine y={y} timestamp={timestamp} width={width} key={timestamp} />
                  })
                : null}
            {previewLineY ? (
                <LoopLine y={previewLineY} timestamp={yToTimestamp(previewLineY)} width={width} />
            ) : null}
        </svg>
    )
}
