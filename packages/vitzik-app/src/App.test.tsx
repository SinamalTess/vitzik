import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import App from './App'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import {
    changeUserInstrument,
    clickAppInfos,
    clickBpmButton,
    clickExtraSettings,
    clickLoopEditorAt,
    clickMidiExample,
    clickPlay,
    clickSetLoopButton,
    clickShowNotesSwitch,
    clickSpeedButton,
    dispatchMidiInputMessageEvent,
    hoverLoopEditorAt,
} from './tests/utils'
import { instrumentPlayerMock } from './tests/mocks/SoundFont'
import { waitRequestMIDIAccessPromise, waitSoundFontInstrumentPromise } from './tests/utils/acts'

const midiInput = new MidiInputMock('Piano', 'Yamaha')

describe('App', () => {
    describe('When there is no midi input', () => {
        beforeEach(() => {
            requestMIDIAccess.mockResolvedValue(midiAccessMock())
            jest.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
        })

        it('should render the initial state', async () => {
            render(<App />)

            await waitSoundFontInstrumentPromise()

            expect(screen.getByText(/Import Midi/i)).toBeVisible()
            expect(screen.getByText(/Music theory/i)).toBeDisabled()
        })

        it('should let the app infos menu be opened', async () => {
            render(<App />)

            await clickAppInfos()

            expect(screen.getByText(/About this app/i)).toBeVisible()
        })

        it('should let the app infos menu be closed', async () => {
            render(<App />)

            await clickAppInfos()
            await clickAppInfos()

            await waitFor(() => {
                expect(screen.queryByText(/About this app/)).not.toBeInTheDocument()
            })
        })
    })

    describe('When there is a midi input', () => {
        beforeEach(async () => {
            requestMIDIAccess.mockResolvedValue(midiAccessMock([midiInput]))
            jest.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
        })

        describe('When no midi file is imported yet', () => {
            it('should render the initial state', async () => {
                render(<App />)

                await waitSoundFontInstrumentPromise()

                expect(screen.getByText(/Import Midi/i)).toBeVisible()
                expect(screen.getByText(/Music theory/i)).toBeVisible()
                expect(screen.getByText(/Piano - Yamaha/i)).toBeVisible()
                expect(screen.getByLabelText(/settings/)).toBeVisible()
            })
            it('should play when receiving a note ON midi input message', async () => {
                render(<App />)

                await waitRequestMIDIAccessPromise()
                await dispatchMidiInputMessageEvent(midiInput, 'A0')
                await waitSoundFontInstrumentPromise()

                expect(screen.getByTestId('A0-active')).toBeInTheDocument()
            })
            it('should stop playing when receiving note OFF midi input message', async () => {
                render(<App />)

                await waitRequestMIDIAccessPromise()
                await dispatchMidiInputMessageEvent(midiInput, 'A0')
                await dispatchMidiInputMessageEvent(midiInput, 'A0', false)
                await waitSoundFontInstrumentPromise()

                expect(screen.queryByTestId('A0-active')).not.toBeInTheDocument()
            })
            describe('When clicking on the settings button', () => {
                it('should open the extra settings sidebar', async () => {
                    render(<App />)

                    await clickExtraSettings()
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByText(/User Instrument/i)).toBeVisible()
                    expect(screen.getAllByAltText(/Acoustic Grand Keyboard/i)).toHaveLength(1) // default instrument image
                })
            })
        })
    })
})
