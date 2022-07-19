import React, { useContext, useEffect, useState } from 'react'
import { MidiCurrentTime } from '../TimeContextProvider/TimeContextProvider'
import './LoopEditor.scss'
import { LoopTimes } from '../../types/LoopTimes'
import { msToTime } from '../../utils'

interface LineProps {
    y: number
    width: number
    timestamp: number
}

function LoopLine({ y, width, timestamp }: LineProps) {
    const yText = y + 20
    return (
        <>
            <line x1="0" y1={y} x2={width} y2={y} stroke="red" strokeWidth={1} />
            <text x="20" y={yText} className="small" fill="red">
                {msToTime(timestamp, true)}
            </text>
        </>
    )
}

export const BASE_CLASS = 'loop-editor'

interface LoopEditorProps {
    loopTimes: LoopTimes
    height: number
    width: number
    msPerSection: number
    onChangeLoopTimes: React.Dispatch<React.SetStateAction<LoopTimes>>
}

export function LoopEditor({
    loopTimes,
    height,
    width,
    msPerSection,
    onChangeLoopTimes,
}: LoopEditorProps) {
    const midiCurrentTime = useContext(MidiCurrentTime)
    const ratio = height / msPerSection
    const allLinesDrawn = !loopTimes.includes(null)
    const [previewLine, setPreviewLine] = useState(0)
    const [startLoop, endLoop] = loopTimes

    useEffect(() => {
        if (allLinesDrawn) {
            setPreviewLine(0)
        }
    }, [allLinesDrawn])

    function handleMouseMove(event: React.MouseEvent<SVGElement>) {
        const timestamp = (height - (event.clientY - 40)) / ratio + midiCurrentTime
        if (startLoop) {
            if (timestamp > startLoop) {
                setPreviewLine(timestamp)
            }
        } else {
            setPreviewLine(timestamp)
        }
    }

    function handleClick(event: React.MouseEvent<SVGElement>) {
        const timestamp = (height - (event.clientY - 40)) / ratio + midiCurrentTime
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
        (loopTime) =>
            loopTime && loopTime > midiCurrentTime && loopTime < midiCurrentTime + msPerSection
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
            {...(allLinesDrawn ? null : props)}
        >
            {lines.length
                ? lines.map((line) => {
                      const y = height - (line - midiCurrentTime) * ratio
                      return <LoopLine y={y} timestamp={line} width={width} />
                  })
                : null}
            {previewLine ? (
                <LoopLine
                    y={height - (previewLine - midiCurrentTime) * ratio}
                    timestamp={previewLine}
                    width={width}
                />
            ) : null}
        </svg>
    )
}
