import React, { useEffect, useState } from 'react'
import './LoopEditor.scss'
import { LoopTimestamps } from '../../types'
import { useIntervalWorker } from '../../hooks/useIntervalWorker'
import { LoopLine } from './events/LoopLine'

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
    const [loopStartTimestamp, loopEndTimestamp] = loopTimestamps
    const [time, setTime] = useState(0)
    const yToTimestamp = (y: number) => (height - y) / ratio + time

    useIntervalWorker(setTime)

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
            {previewLineY ? (
                <LoopLine y={previewLineY} timestamp={yToTimestamp(previewLineY)} width={width} />
            ) : null}
        </svg>
    )
}
