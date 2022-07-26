import React, { useEffect, useState } from 'react'
import './LoopEditor.scss'
import { LoopTimes } from '../../types/LoopTimes'
import { msToTime } from '../../utils'

interface LineProps {
    y: number
    width: number
    timestamp: number
    'data-testid'?: string
}

function LoopLine({ y, width, timestamp }: LineProps) {
    const yText = y + 20
    return (
        <>
            <line
                x1="0"
                y1={y}
                x2={width}
                y2={y}
                stroke="red"
                strokeWidth={1}
                aria-label={'loop-line'}
            />
            <text x="20" y={yText} className="small" fill="red" aria-label={'loop-line-text'}>
                {msToTime(timestamp, true)}
            </text>
        </>
    )
}

export const BASE_CLASS = 'loop-editor'

interface LoopEditorProps {
    worker: Worker
    loopTimes: LoopTimes
    height: number
    width: number
    msPerSection: number
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimes>>
}

export function LoopEditor({
    worker,
    loopTimes,
    height,
    width,
    msPerSection,
    onChangeLoopTimes,
}: LoopEditorProps) {
    const ratio = height / msPerSection
    const allLinesDrawn = !loopTimes.includes(null)
    const [previewLine, setPreviewLine] = useState(0)
    const [startLoop, endLoop] = loopTimes
    const [time, setTime] = useState(0)

    useEffect(() => {
        worker.postMessage({
            code: 'getTime',
        })
        function onMessage(message: MessageEvent) {
            const { time } = message.data
            setTime(time)
        }
        worker.addEventListener('message', onMessage)
        return function cleanup() {
            worker.removeEventListener('message', onMessage)
        }
    }, [])

    useEffect(() => {
        if (allLinesDrawn) {
            setPreviewLine(0)
        }
    }, [allLinesDrawn])

    function handleMouseMove(event: React.MouseEvent<SVGElement>) {
        const y = event.clientY - 40
        const timestamp = (height - y) / ratio + time
        if (startLoop) {
            if (timestamp > startLoop) {
                setPreviewLine(y)
            }
        } else {
            setPreviewLine(y)
        }
    }

    function handleClick(event: React.MouseEvent<SVGElement>) {
        const timestamp = (height - (event.clientY - 40)) / ratio + time
        onChangeLoopTimes((loopTimes) => {
            const [startLoop, endLoop] = loopTimes
            if (startLoop === null) {
                return [timestamp, endLoop]
            } else if (endLoop === null && timestamp > startLoop) {
                return [startLoop, timestamp]
            } else {
                return loopTimes
            }
        })
    }

    const lines = loopTimes.filter(
        (loopTime) => loopTime && loopTime > time && loopTime < time + msPerSection
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
            {lines.length
                ? lines.map((timestamp) => {
                      const y = height - (timestamp - time) * ratio
                      return <LoopLine y={y} timestamp={timestamp} width={width} key={timestamp} />
                  })
                : null}
            {previewLine ? (
                <LoopLine
                    y={previewLine}
                    timestamp={(height - previewLine) / ratio + time}
                    width={width}
                />
            ) : null}
        </svg>
    )
}
