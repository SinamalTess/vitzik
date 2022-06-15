import React, { useEffect, useRef, useState } from 'react'
import { isEven, keyToNote, drawRoundRect } from '../utils'
import './Visualizer.scss'
import { AlphabeticalNote, CanvasRectangle, MidiJsonNote } from '../types'
import isEqual from 'lodash.isequal'
import { ActiveNote } from '../App'
import { AudioPlayerState } from './AudioPlayer'
import { IMidiFile, IMidiNoteOffEvent, IMidiNoteOnEvent, TMidiEvent } from 'midi-json-parser-worker'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from '../utils/const'

//TODO: draw vertical lines to see notes better

interface NoteCoordinates extends CanvasRectangle {
    name: AlphabeticalNote
    key: number
    velocity: number
    duration: number // ms
    id?: number
}

const isNoteOnEvent = (note: TMidiEvent): note is IMidiNoteOnEvent => 'noteOn' in note
const isNoteOffEvent = (note: TMidiEvent): note is IMidiNoteOffEvent => 'noteOff' in note

const isHTMLCanvasElement = (element: ChildNode): element is HTMLCanvasElement =>
    element.nodeName === 'CANVAS'

const getKey = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.noteNumber : note.noteOff.noteNumber

const getVelocity = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.velocity : note.noteOff.velocity

function getNotesCoordinates(
    canvasWidth: number,
    canvasHeight: number,
    midiTrack: IMidiFile,
    heightPerBeat: number,
    midiTrackInfos: MidiTrackInfos
) {
    let notesBeingProcessed: NoteCoordinates[] = []
    const { ticksPerBeat, trackDuration, msPerBeat } = midiTrackInfos
    const { tracks } = midiTrack
    const nbBeatsPerCanvas = canvasHeight / heightPerBeat
    const msPerCanvas = msPerBeat * nbBeatsPerCanvas
    let notesCoordinates: NoteCoordinates[][][] = []

    tracks.forEach((track) => {
        let deltaAcc = 0
        const nbCanvasInTrack = Math.ceil(trackDuration / msPerCanvas)
        let notesCoordinatesInTrack: NoteCoordinates[][] = Array(nbCanvasInTrack).fill([])

        track.forEach((event, index) => {
            deltaAcc = deltaAcc + event.delta

            if (isNoteOnEvent(event)) {
                const key = getKey(event)
                const noteName = keyToNote(key)
                const velocity = getVelocity(event)
                const isBlackKey = noteName.includes('#')
                const widthWhiteKey = canvasWidth / NB_WHITE_PIANO_KEYS
                const w = isBlackKey ? widthWhiteKey / 2 : widthWhiteKey
                const previousKeys = NOTES.alphabetical.slice(0, key - MIDI_PIANO_KEYS_OFFSET)
                const nbPreviousWhiteKeys = previousKeys.filter(
                    (note) => !note.includes('#')
                ).length
                const margin = !isBlackKey ? widthWhiteKey / 4 : widthWhiteKey / 2
                const x = nbPreviousWhiteKeys * widthWhiteKey - margin
                const y = (deltaAcc / midiTrackInfos.ticksPerBeat) * heightPerBeat

                const note: NoteCoordinates = {
                    w,
                    h: deltaAcc,
                    x,
                    y,
                    name: noteName,
                    key,
                    velocity,
                    duration: 0,
                    id: index,
                }

                notesBeingProcessed.push(note)
            } else if (
                isNoteOffEvent(event) ||
                (isNoteOnEvent(event) && event.noteOn.velocity === 0)
            ) {
                const key = getKey(event)
                const noteOnIndex = notesBeingProcessed.findIndex((note, i) => note.key === key)
                if (noteOnIndex !== -1) {
                    const note = { ...notesBeingProcessed[noteOnIndex] }
                    note.duration = ((deltaAcc - note.h) / ticksPerBeat) * msPerBeat
                    note.h = ((deltaAcc - note.h) / ticksPerBeat) * heightPerBeat
                    const startingCanvas = Math.floor(note.y / canvasHeight) // arrays start at 0, so we use floor to get number below
                    const endingCanvas = Math.floor((note.y + note.h) / canvasHeight)
                    notesBeingProcessed.splice(noteOnIndex, 1)
                    for (let i = startingCanvas; i <= endingCanvas; i++) {
                        notesCoordinatesInTrack[i] = [...notesCoordinatesInTrack[i], note]
                    }
                }
            }
        })

        notesCoordinates.push(notesCoordinatesInTrack)
    })

    return notesCoordinates
}

export interface MidiTrackInfos {
    ticksPerBeat: number
    msPerBeat: number
    trackDuration: number
}

interface VisualizerProps {
    activeNotes: ActiveNote[]
    color?: string
    midiTrackCurrentTime: number
    midiTrack: IMidiFile | null
    heightPerBeat?: number
    midiTrackInfos: MidiTrackInfos | null
    audioPlayerState: AudioPlayerState
    onChangeActiveNotes: (notes: ActiveNote[]) => void
}

export function Visualizer({
    activeNotes,
    color = '#00E2DC',
    midiTrackCurrentTime,
    midiTrack,
    heightPerBeat = 100,
    midiTrackInfos,
    audioPlayerState,
    onChangeActiveNotes,
}: VisualizerProps) {
    const visualizerRef = useRef<HTMLDivElement>(null)
    const [notesCoordinates, setNotesCoordinates] = useState<NoteCoordinates[][]>([])
    const [indexCanvas, setIndexCanvas] = useState<number>(0)

    const width = visualizerRef?.current?.clientWidth ?? 0
    const height = visualizerRef?.current?.clientHeight ?? 0
    const canvasChildren = visualizerRef?.current?.childNodes ?? []
    const isIndexEven = isEven(indexCanvas)

    useEffect(() => {
        if (!midiTrackInfos || !midiTrack) return
        const coordinates = getNotesCoordinates(
            width,
            height,
            midiTrack,
            heightPerBeat,
            midiTrackInfos
        )
        setNotesCoordinates(coordinates[coordinates.length - 1]) //TODO: once we support multitracking remove this
    }, [midiTrackInfos])

    useEffect(() => {
        getActiveNotes(midiTrackCurrentTime)
    }, [midiTrackCurrentTime])

    useEffect(() => {
        if (indexCanvas === 0) {
            drawInitialState()
        } else {
            switch (audioPlayerState) {
                case 'playing':
                    drawForward()
                    break
                case 'rewinding':
                    reDrawCurrentState()
                    break
                case 'seeking':
                    reDrawCurrentState()
                    break
                default:
                    break
            }
        }
    }, [indexCanvas, audioPlayerState])

    function drawInitialState() {
        canvasChildren.forEach((child, index) => {
            if (isHTMLCanvasElement(child)) {
                child.width = width
                child.height = height
                const ctx = child.getContext('2d')

                if (ctx) {
                    ctx.fillStyle = color
                    drawNotes(ctx, notesCoordinates, index)
                }
            }
        })
    }

    function drawForward() {
        const canvasToRedraw = isIndexEven ? 1 : 0
        if (canvasChildren[canvasToRedraw]) {
            reDrawCanvas(canvasChildren[canvasToRedraw], indexCanvas + 1)
        }
    }

    function reDrawCurrentState() {
        const canvas1 = isIndexEven ? indexCanvas + 1 : indexCanvas
        const canvas0 = isIndexEven ? indexCanvas : indexCanvas + 1
        canvasChildren.forEach((child, i) => {
            const index = i === 0 ? canvas0 : canvas1
            reDrawCanvas(child, index)
        })
    }

    function reDrawCanvas(canvas: ChildNode, index: number) {
        if (isHTMLCanvasElement(canvas)) {
            const ctx = canvas.getContext('2d')

            if (ctx) {
                ctx.clearRect(0, 0, width, height)
                drawNotes(ctx, notesCoordinates, index)
            }
        }
    }

    function drawNotes(
        ctx: CanvasRenderingContext2D,
        notesCoordinates: NoteCoordinates[][],
        canvasIndex: number
    ) {
        const canvasOffset = ctx.canvas.height

        if (notesCoordinates[canvasIndex] && notesCoordinates[canvasIndex].length) {
            notesCoordinates[canvasIndex].forEach(({ x, y, w, h }) => {
                const yComputed = y - canvasIndex * canvasOffset
                drawRoundRect(ctx, x, yComputed, w, h, 5, true, false)
            })
        }
    }

    function calcTop(canvasIndex: number): string {
        if (midiTrackInfos && visualizerRef.current) {
            const { msPerBeat } = midiTrackInfos
            const nbBeatsPassed = midiTrackCurrentTime / msPerBeat
            const heightDuration = nbBeatsPassed * heightPerBeat
            const nbCanvasPassed = heightDuration / height
            const index = Math.floor(heightDuration / height)
            const percentageTop = Math.round((nbCanvasPassed % 1) * 100)
            const percentageFirstCanvas = `${100 - percentageTop}%`
            const percentageSecondCanvas = `-${percentageTop}%`
            if (index !== indexCanvas) {
                setIndexCanvas(() => index)
            }
            if (canvasIndex === 0) {
                return isIndexEven ? percentageSecondCanvas : percentageFirstCanvas
            } else {
                return isIndexEven ? percentageFirstCanvas : percentageSecondCanvas
            }
        }
        return '0px'
    }

    function getActiveNotes(midiTrackCurrentTime: number) {
        if (!midiTrackInfos) return

        const heightDuration = (midiTrackCurrentTime / midiTrackInfos.msPerBeat) * heightPerBeat

        if (notesCoordinates[indexCanvas] && notesCoordinates[indexCanvas].length) {
            const activeKeys = notesCoordinates[indexCanvas]
                .filter((note) => note.y <= heightDuration && note.y + note.h >= heightDuration)
                .map(({ name, velocity, id, duration, key }) => ({
                    name,
                    velocity,
                    duration,
                    id,
                    key,
                }))

            if (!isEqual(activeKeys, activeNotes)) {
                onChangeActiveNotes(activeKeys)
            }
        }
    }

    return (
        <div className="visualizer" ref={visualizerRef}>
            <canvas
                className={`visualizer__canvas visualizer__canvas--0`}
                style={{ transform: `scaleY(-1) translateY(${calcTop(0)})` }}
            ></canvas>
            <canvas
                className={`visualizer__canvas visualizer__canvas--1`}
                style={{ transform: `scaleY(-1) translateY(${calcTop(1)})` }}
            ></canvas>
        </div>
    )
}
