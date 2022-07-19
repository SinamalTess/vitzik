import React, { useEffect } from 'react'
import { useRef } from 'react'
import { NB_WHITE_PIANO_KEYS } from '../../utils/const'
import './VisualizerNotesTracks.scss'
import { getWidthWhiteKey } from '../../utils'
import clsx from 'clsx'
import { BASE_CLASS as VISUALIZER_BASE_CLASS } from './Visualizer'

interface VisualizerTracksProps {
    height: number
    width: number
}

const BASECLASS = `${VISUALIZER_BASE_CLASS}__notes-tracks`

function drawTrackLines(ctx: CanvasRenderingContext2D, h: number, w: number) {
    ctx.canvas.height = h
    ctx.canvas.width = w
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'

    const widthWhiteKey = getWidthWhiteKey(w)
    const margin = widthWhiteKey / 4

    for (let i = 0; i <= NB_WHITE_PIANO_KEYS; i++) {
        const x = widthWhiteKey * i - margin
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
    }
}

export function VisualizerNotesTracks({ height, width }: VisualizerTracksProps) {
    const refCanvas = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (refCanvas.current && height && width) {
            const ctx = refCanvas.current.getContext('2d')
            if (ctx) {
                drawTrackLines(ctx, height, width)
            }
        }
    }, [height, width])

    const classNames = clsx(BASECLASS)

    return <canvas className={classNames} ref={refCanvas}></canvas>
}
