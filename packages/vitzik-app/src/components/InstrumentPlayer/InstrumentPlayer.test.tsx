import { render } from '@testing-library/react'
import React from 'react'
import { InstrumentPlayer, SoundFont } from './InstrumentPlayer'
import {
    AlphabeticalNote,
    AudioPlayerState,
    InstrumentUserFriendlyName,
    MidiVisualizerActiveNote,
} from '../../types'
import { instrumentPlayerMock } from '../../tests/mocks/SoundFont'
import { MidiInputMock } from '../../tests/mocks/requestMIDIAccess'
import { MIDI_INPUT_CHANNEL } from '../../const'
import { waitSoundFontInstrumentPromise } from '../../tests/utils/acts'
import { Mock, vi } from 'vitest'
import Soundfont from 'soundfont-player'

const activeNote: MidiVisualizerActiveNote = {
    name: 'A0',
    velocity: 100,
    uniqueId: '1',
    duration: 25,
    key: 21,
    channel: 1,
    startingTime: 0,
}

const props = {
    audioContext: new AudioContext(),
    activeNotes: [],
    isMute: false,
    notesToLoad: ['A0'] as AlphabeticalNote[],
    audioPlayerState: 'stopped' as AudioPlayerState,
    instrumentName: 'Acoustic Grand Keyboard' as InstrumentUserFriendlyName,
    soundfont: 'FatBoy' as SoundFont,
    channel: 1,
    onChangeLoadedInstrumentPlayers: () => {},
}

describe('InstrumentPlayer', () => {
    beforeEach(async () => {
        ;(Soundfont.instrument as Mock).mockClear()
        ;(Soundfont.instrument as Mock).mockResolvedValue(() => instrumentPlayerMock)
    })

    it('should load the passed instrument', async () => {
        render(<InstrumentPlayer {...props} />)

        await waitSoundFontInstrumentPromise()

        expect(Soundfont.instrument).toHaveBeenCalledWith(
            expect.anything(),
            'acoustic_grand_piano',
            expect.anything()
        )
    })

    it('should load the FatBoy soundfont', async () => {
        render(<InstrumentPlayer {...props} soundfont={'FatBoy'} />)

        await waitSoundFontInstrumentPromise()

        expect(Soundfont.instrument).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
            notes: ['A0'],
            soundfont: 'FatBoy',
        })
    })

    it('should load the FluidR3_GM soundfont', async () => {
        render(<InstrumentPlayer {...props} soundfont={'FluidR3_GM'} />)

        await waitSoundFontInstrumentPromise()

        expect(Soundfont.instrument).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
            notes: ['A0'],
            soundfont: 'FluidR3_GM',
        })
    })

    it('should load the requested notes', async () => {
        render(<InstrumentPlayer {...props} />)

        await waitSoundFontInstrumentPromise()

        expect(Soundfont.instrument).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
            notes: ['A0'],
            soundfont: 'FatBoy',
        })
    })

    it('should not play when the player is muted', async () => {
        render(<InstrumentPlayer {...props} isMute />)

        expect(Soundfont.instrument).not.toHaveBeenCalled()
    })

    it('should listen to midiInput', async () => {
        const midiInput = new MidiInputMock('Piano', 'Yamaha')
        // @ts-ignore
        render(<InstrumentPlayer {...props} midiInput={midiInput} channel={MIDI_INPUT_CHANNEL} />)

        await waitSoundFontInstrumentPromise()

        expect(instrumentPlayerMock.listenToMidi).toHaveBeenCalled()
    })

    it('should load the drum kit', async () => {
        render(<InstrumentPlayer {...props} instrumentName={'Drum Kit'} />)

        await waitSoundFontInstrumentPromise()

        expect(Soundfont.instrument).toHaveBeenCalledWith(
            expect.anything(),
            'soundfonts/pns_drum_kit.js',
            {
                notes: ['A0'],
                soundfont: 'FatBoy',
            }
        )
    })

    it('should play active notes', async () => {
        const { rerender } = render(<InstrumentPlayer {...props} />)
        await waitSoundFontInstrumentPromise()

        rerender(<InstrumentPlayer {...props} activeNotes={[activeNote]} />)

        expect(instrumentPlayerMock.play).toHaveBeenCalledWith('21', 0, {
            duration: 0.025,
            gain: 0.7874015748031497,
            release: 0,
        })
    })
})
