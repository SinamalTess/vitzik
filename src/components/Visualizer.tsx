import React, { useEffect, useRef, useState } from 'react'
import { getWidthKeys, isBlackKey as checkIsBlackKey, isEven, keyToNote } from '../utils'
import './Visualizer.scss'
import {
    AlphabeticalNote,
    AudioPlayerState,
    MidiJsonNote,
    MidiInfos,
    NoteCoordinates,
} from '../types'
import isEqual from 'lodash.isequal'
import { ActiveNote } from '../App'
import { IMidiFile, IMidiNoteOffEvent, IMidiNoteOnEvent, TMidiEvent } from 'midi-json-parser-worker'
import { MIDI_PIANO_KEYS_OFFSET, NOTES } from '../utils/const'
import { VisualizerSection } from './VisualizerSection'
import { VisualizerTracks } from './VisualizerTracks'

interface PartialNote {
    key: number
    velocity: number
    name: AlphabeticalNote
}

interface VisualizerProps {
    activeNotes: ActiveNote[]
    color?: string
    midiTrackCurrentTime: number
    midiFile: IMidiFile | null
    heightPerBeat?: number
    midiInfos: MidiInfos | null
    audioPlayerState: AudioPlayerState
    onChangeActiveNotes: (notes: ActiveNote[]) => void
}

interface IndexToDraw {
    firstSection: number
    secondSection: number
}

type SectionName = keyof IndexToDraw

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
    containerWidth: number,
    ticksPerBeat: number,
    heightPerBeat: number
) {
    const { name, key } = note
    const isBlackKey = checkIsBlackKey(name)
    const { widthWhiteKey, widthBlackKey } = getWidthKeys(containerWidth)
    const previousKeys = NOTES.alphabetical.slice(0, key - MIDI_PIANO_KEYS_OFFSET)
    const nbPreviousWhiteKeys = previousKeys.filter((note) => !checkIsBlackKey(note)).length
    const margin = isBlackKey ? widthBlackKey : widthWhiteKey / 4
    const w = isBlackKey ? widthBlackKey : widthWhiteKey
    const y = (deltaAcc / ticksPerBeat) * heightPerBeat
    const x = nbPreviousWhiteKeys * widthWhiteKey - margin

    return {
        w,
        y,
        h: deltaAcc, // temporary value, should be replaced once the noteOffEvent is sent
        x,
    }
}

function getActiveNotes(
    midiTrackCurrentTime: number,
    midiTrackInfos: MidiInfos | null,
    heightPerBeat: number,
    notesCoordinates: NoteCoordinates[][],
    indexSectionPlaying: number
): ActiveNote[] {
    if (!midiTrackInfos) return []

    const { msPerBeat } = midiTrackInfos
    const heightDuration = (midiTrackCurrentTime / msPerBeat) * heightPerBeat

    if (notesCoordinates[indexSectionPlaying] && notesCoordinates[indexSectionPlaying].length) {
        return notesCoordinates[indexSectionPlaying]
            .filter((note) => note.y <= heightDuration && note.y + note.h >= heightDuration)
            .map(({ name, velocity, id, duration, key }) => ({
                name,
                velocity,
                duration,
                id,
                key,
            }))
    }

    return []
}

function getNotesPosition(
    containerDimensions: {
        w: number
        h: number
    },
    midiTrack: IMidiFile,
    heightPerBeat: number,
    midiTrackInfos: MidiInfos
) {
    const { ticksPerBeat, trackDuration, msPerBeat } = midiTrackInfos
    const { w, h } = containerDimensions
    const { tracks } = midiTrack
    const nbBeatsPerSection = h / heightPerBeat
    const msPerSection = msPerBeat * nbBeatsPerSection
    const nbSectionInTrack = Math.ceil(trackDuration / msPerSection)
    let notesCoordinates: NoteCoordinates[][][] = []

    tracks.forEach((track) => {
        let deltaAcc = 0
        let notesBeingProcessed: NoteCoordinates[] = []
        let notesCoordinatesInTrack: NoteCoordinates[][] = Array(nbSectionInTrack).fill([])

        track.forEach((event, index) => {
            deltaAcc = deltaAcc + event.delta

            if (isNoteOnEvent(event)) {
                const midiNote = getNoteInfos(event)
                const noteCoordinates = getNoteCoordinates(
                    midiNote,
                    deltaAcc,
                    w,
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
                    (note) => note.key === key
                )
                if (correspondingNoteOnIndex !== -1) {
                    const note = { ...notesBeingProcessed[correspondingNoteOnIndex] }
                    const nbBeatsInNote = (deltaAcc - note.h) / ticksPerBeat
                    note.duration = nbBeatsInNote * msPerBeat
                    note.h = nbBeatsInNote * heightPerBeat
                    const startingSection = Math.floor(note.y / h) // arrays start at 0, so we use floor to get number below
                    const endingSection = Math.floor((note.y + note.h) / h)
                    notesBeingProcessed.splice(correspondingNoteOnIndex, 1)
                    for (let i = startingSection; i <= endingSection; i++) {
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
    midiFile,
    heightPerBeat = 100,
    midiInfos,
    audioPlayerState,
    onChangeActiveNotes,
}: VisualizerProps) {
    const visualizerRef = useRef<HTMLDivElement>(null)
    const [notesCoordinates, setNotesCoordinates] = useState<NoteCoordinates[][]>([])
    const [indexSectionPlaying, setIndexSectionPlaying] = useState<number>(0)
    const [indexToDraw, setIndexToDraw] = useState<IndexToDraw>({
        firstSection: 0,
        secondSection: 1,
    })
    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        width: window.innerWidth,
    })

    const { width, height } = dimensions

    React.useEffect(() => {
        function handleResize() {
            setDimensions({
                height: visualizerRef?.current?.clientHeight ?? 0,
                width: visualizerRef?.current?.clientWidth ?? 0,
            })
        }

        window.addEventListener('resize', handleResize)

        return function cleanup() {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        if (!midiInfos || !midiFile) return
        const coordinates = getNotesPosition(
            { w: width, h: height },
            midiFile,
            heightPerBeat,
            midiInfos
        )
        setNotesCoordinates(coordinates[coordinates.length - 1]) //TODO: once we support multitracking remove this
    }, [midiInfos, width, height, midiFile, heightPerBeat])

    useEffect(() => {
        const activeKeys = getActiveNotes(
            midiTrackCurrentTime,
            midiInfos,
            heightPerBeat,
            notesCoordinates,
            indexSectionPlaying
        )
        if (!isEqual(activeKeys, activeNotes)) {
            onChangeActiveNotes(activeKeys)
        }
    }, [midiTrackCurrentTime])

    useEffect(() => {
        const isIndexEven = isEven(indexSectionPlaying)
        if (indexSectionPlaying === 0) {
            setIndexToDraw({
                firstSection: 0,
                secondSection: 1,
            })
        } else {
            if (audioPlayerState === 'playing') {
                const sectionToRedraw: SectionName = isIndexEven ? 'secondSection' : 'firstSection'
                const indexToDrawCopy = { ...indexToDraw }
                indexToDrawCopy[sectionToRedraw] = indexSectionPlaying + 1
                setIndexToDraw(indexToDrawCopy)
            } else if (audioPlayerState === 'rewinding' || audioPlayerState === 'seeking') {
                setIndexToDraw({
                    firstSection: isIndexEven ? indexSectionPlaying : indexSectionPlaying + 1,
                    secondSection: isIndexEven ? indexSectionPlaying + 1 : indexSectionPlaying,
                })
            }
        }
    }, [indexSectionPlaying, audioPlayerState, notesCoordinates])

    function calcTop(sectionName: SectionName) {
        if (!midiInfos) return '0px'
        const { msPerBeat } = midiInfos
        const nbBeatsPassed = midiTrackCurrentTime / msPerBeat
        const heightDuration = nbBeatsPassed * heightPerBeat
        const nbSectionPassed = heightDuration / height
        const percentageTop = +((nbSectionPassed % 1) * 100).toFixed(2)
        const percentageFirstSection = `${100 - percentageTop}%`
        const percentageSecondSection = `-${percentageTop}%`
        const isIndexEven = isEven(indexSectionPlaying)
        const index = Math.floor(heightDuration / height)

        if (index !== indexSectionPlaying) {
            setIndexSectionPlaying(() => index)
        }

        if (sectionName === 'firstSection') {
            return isIndexEven ? percentageSecondSection : percentageFirstSection
        } else {
            return isIndexEven ? percentageFirstSection : percentageSecondSection
        }
    }

    return (
        <div className="visualizer" ref={visualizerRef}>
            {(['firstSection', 'secondSection'] as SectionName[]).map((name, index) => (
                <VisualizerSection
                    index={index}
                    key={name}
                    indexToDraw={indexToDraw[name]}
                    notesCoordinates={notesCoordinates}
                    top={calcTop(name)}
                    height={height}
                    width={width}
                    color={color}
                />
            ))}
            <VisualizerTracks height={height} width={width} />
        </div>
    )
}
