import React, { useEffect } from 'react'
import { useRef } from 'react'
import { NB_WHITE_PIANO_KEYS } from '../../utils/const'
import './MidiVisualizerVerticalLines.scss'
import clsx from 'clsx'
import { KeyboardFactory } from '../Keyboard/KeyboardFactory'

interface MidiVisualizerTracksProps {
    height: number
    width: number
}

const BASECLASS = `midi-visualizer__vertical-lines`

function drawTrackLines(ctx: CanvasRenderingContext2D, h: number, w: number) {
    ctx.canvas.height = h
    ctx.canvas.width = w
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'

    const { widthWhiteKey } = KeyboardFactory.getWidthKeys(w)
    const margin = widthWhiteKey / 4

    for (let i = 0; i <= NB_WHITE_PIANO_KEYS; i++) {
        const x = widthWhiteKey * i - margin
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
    }
}

export function MidiVisualizerVerticalLines({ height, width }: MidiVisualizerTracksProps) {
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
