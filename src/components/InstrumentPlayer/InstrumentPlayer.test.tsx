import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { InstrumentPlayer, SoundFont } from './InstrumentPlayer'
import { AudioPlayerState, InstrumentUserFriendlyName, MidiVisualizerActiveNote } from '../../types'
import Soundfont from 'soundfont-player'
import Mock = jest.Mock

jest.mock('soundfont-player', () => ({
    instrument: jest.fn(),
}))

describe('InstrumentPlayer', () => {
    const activeNote: MidiVisualizerActiveNote = {
        name: 'A0',
        velocity: 100,
        id: '1',
        duration: 25,
        key: 21,
        channel: 0,
        startingTime: 0,
    }

    const props = {
        audioContext: new AudioContext(),
        activeNotes: [activeNote],
        isMute: false,
        notesToLoad: [],
        audioPlayerState: 'stopped' as AudioPlayerState,
        instrumentName: 'Acoustic Grand Keyboard' as InstrumentUserFriendlyName,
        soundfont: 'FatBoy' as SoundFont,
        channel: 0,
        onChangeLoadedInstrumentPlayers: () => {},
    }

    it('should load the passed instrument', async () => {
        ;(Soundfont.instrument as Mock).mockResolvedValueOnce('fakeInstrumentPlayer')
        render(<InstrumentPlayer {...props}></InstrumentPlayer>)

        await waitFor(() => {
            expect(Soundfont.instrument).toHaveBeenCalledWith(
                expect.anything(),
                'acoustic_grand_piano',
                expect.anything()
            )
        })
    })

    it('should load the passed soundfont', async () => {
        ;(Soundfont.instrument as Mock).mockResolvedValueOnce('fakeInstrumentPlayer')
        render(<InstrumentPlayer {...props} soundfont={'FatBoy'}></InstrumentPlayer>)

        await waitFor(() => {
            expect(Soundfont.instrument).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                {
                    notes: [],
                    soundfont: 'FatBoy',
                }
            )
        })
    })

    it('should load the requested notes', async () => {
        ;(Soundfont.instrument as Mock).mockResolvedValueOnce('fakeInstrumentPlayer')
        render(<InstrumentPlayer {...props} notesToLoad={['A0']}></InstrumentPlayer>)

        await waitFor(() => {
            expect(Soundfont.instrument).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                {
                    notes: ['A0'],
                    soundfont: 'FatBoy',
                }
            )
        })
    })
})
