import React, { useEffect, useRef, useState } from 'react'
import { isEven, keyToNote, drawRoundRect, isBlackKey as checkIsBlackKey } from '../utils'
import './Visualizer.scss'
import { AlphabeticalNote, AudioPlayerState, CanvasRectangle, MidiJsonNote } from '../types'
import isEqual from 'lodash.isequal'
import { ActiveNote } from '../App'
import { IMidiFile, IMidiNoteOffEvent, IMidiNoteOnEvent, TMidiEvent } from 'midi-json-parser-worker'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from '../utils/const'

//TODO: draw vertical lines to see notes better

interface NoteCoordinates extends CanvasRectangle {
    name: AlphabeticalNote
    key: number
    velocity: number
    duration: number // milliseconds
    id?: number
}

interface PartialNote {
    key: number
    velocity: number
    name: AlphabeticalNote
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

const isNoteOnEvent = (note: TMidiEvent): note is IMidiNoteOnEvent => 'noteOn' in note
const isNoteOffEvent = (note: TMidiEvent): note is IMidiNoteOffEvent => 'noteOff' in note

const isHTMLCanvasElement = (element: ChildNode): element is HTMLCanvasElement =>
    element.nodeName === 'CANVAS'

const getKey = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.noteNumber : note.noteOff.noteNumber

const getVelocity = (note: MidiJsonNote) =>
    isNoteOnEvent(note) ? note.noteOn.velocity : note.noteOff.velocity

function getNoteInfos(note: MidiJsonNote): PartialNote {
    const key = getKey(note)
    const name = keyToNote(key)
    const velocity = getVelocity(note)

    return {
        key,
        name,
        velocity,
    }
}

function getNoteCoordinates(
    note: PartialNote,
    deltaAcc: number,
    canvasWidth: number,
    ticksPerBeat: number,
    heightPerBeat: number
) {
    const { name, key } = note
    const isBlackKey = checkIsBlackKey(name)
    const widthWhiteKey = canvasWidth / NB_WHITE_PIANO_KEYS
    const widthBlackKey = widthWhiteKey / 2
    const w = isBlackKey ? widthBlackKey : widthWhiteKey
    const previousKeys = NOTES.alphabetical.slice(0, key - MIDI_PIANO_KEYS_OFFSET)
    const nbPreviousWhiteKeys = previousKeys.filter((note) => !checkIsBlackKey(note)).length
    const margin = isBlackKey ? widthBlackKey : widthWhiteKey / 4
    const x = nbPreviousWhiteKeys * widthWhiteKey - margin
    const y = (deltaAcc / ticksPerBeat) * heightPerBeat

    return {
        w,
        y,
        h: deltaAcc, // temporary value, should be replaced once the noteOffEvent is sent
        x,
    }
}

function getNotesPosition(
    canvasWidth: number,
    canvasHeight: number,
    midiTrack: IMidiFile,
    heightPerBeat: number,
    midiTrackInfos: MidiTrackInfos
) {
    const { ticksPerBeat, trackDuration, msPerBeat } = midiTrackInfos
    const { tracks } = midiTrack
    const nbBeatsPerCanvas = canvasHeight / heightPerBeat
    const msPerCanvas = msPerBeat * nbBeatsPerCanvas
    const nbCanvasInTrack = Math.ceil(trackDuration / msPerCanvas)
    let notesCoordinates: NoteCoordinates[][][] = []

    tracks.forEach((track) => {
        let deltaAcc = 0
        let notesBeingProcessed: NoteCoordinates[] = []
        let notesCoordinatesInTrack: NoteCoordinates[][] = Array(nbCanvasInTrack).fill([])

        track.forEach((event, index) => {
            deltaAcc = deltaAcc + event.delta

            if (isNoteOnEvent(event)) {
                const midiNote = getNoteInfos(event)
                const noteCoordinates = getNoteCoordinates(
                    midiNote,
                    deltaAcc,
                    canvasWidth,
                    ticksPerBeat,
                    heightPerBeat
                )

                const note: NoteCoordinates = {
                    ...noteCoordinates,
                    ...midiNote,
                    duration: 0, // to be replaced once the noteOff event is received
                    id: index,
                }

                notesBeingProcessed.push(note)
            } else if (
                isNoteOffEvent(event) ||
                (isNoteOnEvent(event) && event.noteOn.velocity === 0)
            ) {
                const key = getKey(event)
                const correspondingNoteOnIndex = notesBeingProcessed.findIndex(
                    (note, i) => note.key === key
                )
                if (correspondingNoteOnIndex !== -1) {
                    const note = { ...notesBeingProcessed[correspondingNoteOnIndex] }
                    const nbBeatsInNote = (deltaAcc - note.h) / ticksPerBeat
                    note.duration = nbBeatsInNote * msPerBeat
                    note.h = nbBeatsInNote * heightPerBeat
                    const startingCanvas = Math.floor(note.y / canvasHeight) // arrays start at 0, so we use floor to get number below
                    const endingCanvas = Math.floor((note.y + note.h) / canvasHeight)
                    notesBeingProcessed.splice(correspondingNoteOnIndex, 1)
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

function drawInitialState(
    canvasChildren: never[] | NodeListOf<ChildNode>,
    color: string,
    notesCoordinates: NoteCoordinates[][],
    width: number,
    height: number
) {
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

function reDrawCanvas(canvas: ChildNode, index: number, notesCoordinates: NoteCoordinates[][]) {
    if (isHTMLCanvasElement(canvas)) {
        const ctx = canvas.getContext('2d')

        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            drawNotes(ctx, notesCoordinates, index)
        }
    }
}

function drawForward(
    canvasChildren: never[] | NodeListOf<ChildNode>,
    indexCanvas: number,
    notesCoordinates: NoteCoordinates[][]
) {
    const isIndexEven = isEven(indexCanvas)
    const canvasToRedraw = isIndexEven ? 1 : 0
    if (canvasChildren[canvasToRedraw]) {
        reDrawCanvas(canvasChildren[canvasToRedraw], indexCanvas + 1, notesCoordinates)
    }
}

function reDrawCurrentState(
    canvasChildren: never[] | NodeListOf<ChildNode>,
    indexCanvas: number,
    notesCoordinates: NoteCoordinates[][]
) {
    const isIndexEven = isEven(indexCanvas)
    const canvas1 = isIndexEven ? indexCanvas + 1 : indexCanvas
    const canvas0 = isIndexEven ? indexCanvas : indexCanvas + 1
    canvasChildren.forEach((child, i) => {
        const index = i === 0 ? canvas0 : canvas1
        reDrawCanvas(child, index, notesCoordinates)
    })
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

    useEffect(() => {
        if (!midiTrackInfos || !midiTrack) return
        const coordinates = getNotesPosition(
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
            drawInitialState(canvasChildren, color, notesCoordinates, width, height)
        } else {
            switch (audioPlayerState) {
                case 'playing':
                    drawForward(canvasChildren, indexCanvas, notesCoordinates)
                    break
                case 'rewinding':
                    reDrawCurrentState(canvasChildren, indexCanvas, notesCoordinates)
                    break
                case 'seeking':
                    reDrawCurrentState(canvasChildren, indexCanvas, notesCoordinates)
                    break
                default:
                    break
            }
        }
    }, [indexCanvas, audioPlayerState, notesCoordinates])

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
            const isIndexEven = isEven(indexCanvas)

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
