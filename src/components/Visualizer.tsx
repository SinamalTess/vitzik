import React, { useEffect, useRef, useState } from 'react'
import { keyToNote, isBlackKey as checkIsBlackKey, isEven } from '../utils'
import './Visualizer.scss'
import { AlphabeticalNote, AudioPlayerState, MidiJsonNote, NoteCoordinates } from '../types'
import isEqual from 'lodash.isequal'
import { ActiveNote } from '../App'
import { IMidiFile, IMidiNoteOffEvent, IMidiNoteOnEvent, TMidiEvent } from 'midi-json-parser-worker'
import { MIDI_PIANO_KEYS_OFFSET, NB_WHITE_PIANO_KEYS, NOTES } from '../utils/const'
import { VisualizerSection } from './VisualizerSection'
import { MidiTrackInfos } from '../types'
import { VisualizerTracks } from './VisualizerTracks'

//TODO: draw vertical lines to see notes better

interface PartialNote {
    key: number
    velocity: number
    name: AlphabeticalNote
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
    const [indexCanvasPlaying, setIndexCanvasPlaying] = useState<number>(0)
    const [indexToDraw, setIndexToDraw] = useState<{
        canvas0: number
        canvas1: number
    }>({
        canvas0: 0,
        canvas1: 1,
    })

    const width = visualizerRef?.current?.clientWidth ?? 0
    const height = visualizerRef?.current?.clientHeight ?? 0

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
        const isIndexEven = isEven(indexCanvasPlaying)
        if (indexCanvasPlaying === 0) {
            setIndexToDraw({
                canvas0: 0,
                canvas1: 1,
            })
        } else {
            if (audioPlayerState === 'playing') {
                const canvasToRedraw = isIndexEven ? 'canvas1' : 'canvas0'
                const indexToDrawCopy = { ...indexToDraw }
                indexToDrawCopy[canvasToRedraw] = indexCanvasPlaying + 1
                setIndexToDraw(indexToDrawCopy)
            } else if (audioPlayerState === 'rewinding' || audioPlayerState === 'seeking') {
                setIndexToDraw({
                    canvas0: isIndexEven ? indexCanvasPlaying : indexCanvasPlaying + 1,
                    canvas1: isIndexEven ? indexCanvasPlaying + 1 : indexCanvasPlaying,
                })
            }
        }
    }, [indexCanvasPlaying, audioPlayerState, notesCoordinates])

    function getActiveNotes(midiTrackCurrentTime: number) {
        if (!midiTrackInfos) return

        const heightDuration = (midiTrackCurrentTime / midiTrackInfos.msPerBeat) * heightPerBeat

        if (notesCoordinates[indexCanvasPlaying] && notesCoordinates[indexCanvasPlaying].length) {
            const activeKeys = notesCoordinates[indexCanvasPlaying]
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

    function calcTop(indexCanvas: number) {
        if (!midiTrackInfos) return '0px'
        const { msPerBeat } = midiTrackInfos
        const nbBeatsPassed = midiTrackCurrentTime / msPerBeat
        const heightDuration = nbBeatsPassed * heightPerBeat
        const nbCanvasPassed = heightDuration / height
        const percentageTop = +((nbCanvasPassed % 1) * 100).toFixed(2)
        const percentageFirstCanvas = `${100 - percentageTop}%`
        const percentageSecondCanvas = `-${percentageTop}%`
        const isIndexEven = isEven(indexCanvasPlaying)
        const index = Math.floor(heightDuration / height)

        if (index !== indexCanvasPlaying) {
            setIndexCanvasPlaying(() => index)
        }

        if (indexCanvas === 0) {
            return isIndexEven ? percentageSecondCanvas : percentageFirstCanvas
        } else {
            return isIndexEven ? percentageFirstCanvas : percentageSecondCanvas
        }
    }

    return (
        <div className="visualizer" ref={visualizerRef}>
            {['canvas0', 'canvas1'].map((name, index) => (
                <VisualizerSection
                    index={index}
                    key={name}
                    indexCanvasPlaying={indexCanvasPlaying}
                    indexToDraw={name === 'canvas0' ? indexToDraw.canvas0 : indexToDraw.canvas1}
                    notesCoordinates={notesCoordinates}
                    top={calcTop(index)}
                    height={height}
                    width={width}
                    color={color}
                />
            ))}
            <VisualizerTracks height={height} width={width} />
        </div>
    )
}
