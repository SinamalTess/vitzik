import React, { useEffect, useState } from 'react'
import './LoopEditor.scss'
import { LoopTimestamps } from '@/types'
import { useIntervalWorker } from '@/hooks'
import { LoopLine } from '../LoopLine/LoopLine'
import { MidiVisualizerConfig } from '@/types/MidiVisualizerConfig'

export const BASE_CLASS = 'loop-editor'

interface LoopEditorProps {
    config: MidiVisualizerConfig
    onWheel: (e: WheelEvent) => void
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
}

export function LoopEditor({ config, onWheel, onChangeLoopTimestamps }: LoopEditorProps) {
    const [previewLineY, setPreviewLineY] = useState(0)
    const { timeRef } = useIntervalWorker(onTimeChange)
    const { height, width, msPerSection, loopTimestamps } = config
    const [loopStartTimestamp, loopEndTimestamp] = loopTimestamps
    const ratio = height / msPerSection
    const allLinesDrawn = !loopTimestamps.includes(null)
    const yToTimestamp = (y: number) => (height - y) / ratio + timeRef.current

    useEffect(() => {
        if (allLinesDrawn) {
            setPreviewLineY(0)
        }
    }, [allLinesDrawn])

    function onTimeChange(time: number) {
        timeRef.current = time
    }

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
            // @ts-ignore
            onWheel={onWheel}
            height={height}
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
