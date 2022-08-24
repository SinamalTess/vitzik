import { MidiTitle } from '../MidiTitle'
import { MidiImporter } from '../MidiImporter'
import { Visualizer } from '../Visualizer'
import { Keyboard } from '../Keyboard'
import { InstrumentPlayer } from '../InstrumentPlayer'
import React, { useCallback, useEffect, useState } from 'react'
import { MidiMessageManager } from '../MidiMessageManager'
import {
    Instrument,
    ActiveNote,
    AudioPlayerState,
    InstrumentUserFriendlyName,
    MidiAccessMode,
    MidiMetas,
    MidiPlayMode,
    MusicSystem,
    LoopTimestamps,
} from '../../types'
import { IMidiFile } from 'midi-json-parser-worker'
import { getMidiMetas, MidiFactory } from '../../utils'
import { DEFAULT_INSTRUMENTS } from '../../utils/const'

const AUDIO_CONTEXT = new AudioContext()

/*
    Suspends the progression of time in the audio context,
    temporarily halting audio hardware access and reducing CPU/battery usage in the process.
*/
function suspendAudioContext() {
    const suspend = async () => {
        await AUDIO_CONTEXT.suspend()
    }
    suspend().catch((e) => console.error(e))
}

function resumeAudioContext() {
    const resume = async () => {
        await AUDIO_CONTEXT.resume()
    }
    resume().catch((e) => console.error(e))
}

interface PreviewProps {
    isMute: boolean
    showNotes: boolean
    midiTitle: string
    loopTimestamps: LoopTimestamps
    activeTracks: number[]
    audioPlayerState: AudioPlayerState
    midiInput: MIDIInput | null
    midiOutput: MIDIOutput | null
    musicSystem: MusicSystem
    midiAccessMode: MidiAccessMode
    midiMetas: MidiMetas | null
    midiPlayMode: MidiPlayMode
    activeInstruments: Instrument[]
    isEditingLoop: boolean
    onChangeActiveInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>
    onChangeMidiTitle: React.Dispatch<React.SetStateAction<string>>
    onChangeLoopTimestamps: React.Dispatch<React.SetStateAction<LoopTimestamps>>
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onChangeAudioPlayerState: React.Dispatch<React.SetStateAction<AudioPlayerState>>
    onChangeMidiMetas: React.Dispatch<React.SetStateAction<MidiMetas | null>>
    onChangeLoadedInstrumentPlayers: React.Dispatch<
        React.SetStateAction<InstrumentUserFriendlyName[]>
    >
}

export function Preview({
    isMute,
    showNotes,
    activeTracks,
    loopTimestamps,
    midiInput,
    midiOutput,
    midiMetas,
    midiPlayMode,
    musicSystem,
    midiAccessMode,
    midiTitle,
    activeInstruments,
    audioPlayerState,
    isEditingLoop,
    onChangeActiveInstruments,
    onChangeMidiTitle,
    onChangeLoopTimestamps,
    onChangeActiveTracks,
    onChangeAudioPlayerState,
    onChangeMidiMetas,
    onChangeLoadedInstrumentPlayers,
}: PreviewProps) {
    const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([])
    const [midiFile, setMidiFile] = useState<IMidiFile | null>(null)
    const [nextNoteStartingTime, setnextNoteStartingTime] = useState<number | null>(null)

    useEffect(() => {
        if (isMute) {
            suspendAudioContext()
        } else {
            resumeAudioContext()
        }
    }, [isMute])

    const handleAllMidiKeysPlayed = useCallback(
        function handleAllMidiKeysPlayed() {
            const shouldPlayForward = nextNoteStartingTime && midiPlayMode === 'waitForValidInput'
            if (shouldPlayForward) {
                onChangeAudioPlayerState('playing')
            }
        },
        [midiPlayMode, nextNoteStartingTime]
    )

    function handleMidiImport(title: string, midiJSON: IMidiFile) {
        const metas = getMidiMetas(midiJSON)
        const playableTracks = metas.tracksMetas.filter((track) => track.isPlayable)
        const { instruments } = metas
        const initialInstruments = MidiFactory.getInitialInstruments(instruments)

        onChangeMidiTitle(title)
        setMidiFile(midiJSON)
        onChangeMidiMetas(metas)
        onChangeActiveInstruments([...DEFAULT_INSTRUMENTS, ...initialInstruments])
        onChangeActiveTracks(playableTracks.map(({ index }) => index))
        onChangeAudioPlayerState('stopped')
        onChangeLoopTimestamps([null, null])
        // console.log(midiJSON)
        // console.log(metas)
    }

    return (
        <>
            <div className="item preview">
                {midiInput ? (
                    <MidiMessageManager
                        midiAccessMode={midiAccessMode}
                        audioPlayerState={audioPlayerState}
                        midiInput={midiInput}
                        midiOutput={midiOutput}
                        activeNotes={activeNotes}
                        onChangeActiveNotes={setActiveNotes}
                        onAllMidiKeysPlayed={handleAllMidiKeysPlayed}
                    />
                ) : null}
                {midiMetas ? <MidiTitle midiTitle={midiTitle} /> : null}
                <MidiImporter isMidiImported={Boolean(midiMetas)} onMidiImport={handleMidiImport} />
                <Visualizer
                    loopTimestamps={loopTimestamps}
                    nextNoteStartingTime={nextNoteStartingTime}
                    activeInstruments={activeInstruments}
                    midiPlayMode={midiPlayMode}
                    isEditingLoop={isEditingLoop}
                    midiFile={midiFile}
                    midiMetas={midiMetas}
                    activeTracks={activeTracks}
                    onChangeActiveNotes={setActiveNotes}
                    onChangeNextNoteStartingTime={setnextNoteStartingTime}
                    onChangeActiveInstruments={onChangeActiveInstruments}
                    onChangeLoopTimestamps={onChangeLoopTimestamps}
                    onChangeAudioPlayerState={onChangeAudioPlayerState}
                />
            </div>
            <div className="item">
                <Keyboard
                    activeNotes={activeNotes}
                    musicSystem={musicSystem}
                    midiPlayMode={midiPlayMode}
                    showNotes={showNotes}
                    onAllMidiKeysPlayed={handleAllMidiKeysPlayed}
                    onChangeActiveNotes={setActiveNotes}
                />
                {activeInstruments.map(({ channel, name, notes }) => {
                    return (
                        <InstrumentPlayer
                            audioPlayerState={audioPlayerState}
                            midiInput={midiInput}
                            audioContext={AUDIO_CONTEXT}
                            key={`${name}-${channel}`}
                            isMute={isMute}
                            activeNotes={activeNotes}
                            instrumentName={name}
                            notesToLoad={[...notes]}
                            channel={channel}
                            onChangeLoadedInstrumentPlayers={onChangeLoadedInstrumentPlayers}
                        />
                    )
                })}
            </div>
        </>
    )
}
