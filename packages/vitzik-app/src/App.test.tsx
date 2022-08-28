import { act, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import App from './App'
import { midiAccessMock, MidiInputMock, requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import {
    changeUserInstrument,
    clickAppInfos,
    clickAutoplaySwitch,
    clickBpmButton,
    clickExtraSettings,
    clickLoopEditorAt,
    clickMidiExample,
    clickPause,
    clickPlay,
    clickSetLoopButton,
    clickShowNotesSwitch,
    clickSpeedButton,
    clickStop,
    clickVolume,
    dispatchMidiInputMessageEvent,
    hoverLoopEditorAt,
    pressKey,
    touchKey,
} from './tests/utils'
import { instrumentPlayerMock } from './tests/mocks/SoundFont'

const midiInput = new MidiInputMock('Piano', 'Yamaha')

const waitSoundFontInstrumentPromise = async () => {
    await act(async () => {
        await Soundfont.instrument
    })
}
const waitRequestMIDIAccessPromise = async () => {
    await act(async () => {
        await requestMIDIAccess
    })
}

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

        describe('When a midi file is imported', () => {
            describe('The keyboard', () => {
                it('should set to active a key when touched', async () => {
                    render(<App />)

                    await waitRequestMIDIAccessPromise()
                    await touchKey('A0')

                    const correspondingKey = screen.getByTestId(/A0/)
                    expect(correspondingKey).toHaveClass('keyboard__whitekey--active')
                })
            })
            describe('The audio player', () => {
                it('should render', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getAllByText('Turkish March - Mozart')[0]).toBeInTheDocument()
                    expect(screen.getByText('03:18')).toBeInTheDocument()
                    expect(screen.getByLabelText('volume')).toBeInTheDocument()
                    expect(screen.getByLabelText('stop')).toBeInTheDocument()
                    expect(screen.getByLabelText('paused')).toBeInTheDocument()
                })
                it('should play when the play button is clicked', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickPlay()
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('play')).toBeInTheDocument()
                })
                it('should mute and unmute when the autoplay switch is clicked', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickAutoplaySwitch()
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('muted')).toBeInTheDocument()

                    await clickAutoplaySwitch()

                    expect(screen.queryByLabelText('muted')).not.toBeInTheDocument()
                })
                it('should mute and unmute when the (m) shortcut is used', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await pressKey('{m}')
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('muted')).toBeInTheDocument()

                    await pressKey('{m}')

                    expect(screen.queryByLabelText('muted')).not.toBeInTheDocument()
                })
                it('should enter and exit loop mode when the (l) shortcut is used', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await pressKey('{l}')
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByTestId('loop-editor')).toBeInTheDocument()

                    await pressKey('{l}')

                    expect(screen.queryByTestId('loop-editor')).not.toBeInTheDocument()
                })
                it('should stop when the stop button is clicked', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickPlay()
                    await clickStop()
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('paused')).toBeInTheDocument()
                })
                it('should pause when the paused button is clicked', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickPlay()
                    await clickPause()
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('paused')).toBeInTheDocument()
                })
                it('should mute and unmute when the volume button is clicked', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickVolume()
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('muted')).toBeInTheDocument()

                    await clickVolume()

                    expect(screen.getByLabelText('volume')).toBeInTheDocument()
                })
                it('should play when the space bar is pressed', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await pressKey('[space]')
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('play')).toBeInTheDocument()
                })
                it('should pause when the space bar is pressed while the player was playing', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await pressKey('[space]')
                    await pressKey('[space]')
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('paused')).toBeInTheDocument()
                })
                it('should resume playing when the space bar is pressed while the player was paused', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await pressKey('[space]')
                    await pressKey('[space]')
                    await pressKey('[space]')
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('play')).toBeInTheDocument()
                })
            })

            describe('The settings', () => {
                it('should show the first bpm value', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText(/beats per minute/)).toBeVisible()
                    expect(screen.getByLabelText(/beats per minute/)).toHaveTextContent('135')
                })
                it('should let the bpm value be changed', async () => {
                    const initialBpm = 135
                    const speedValue = 2
                    const expectedBpm = initialBpm * speedValue
                    render(<App />)

                    await clickMidiExample()
                    await clickBpmButton()
                    await clickSpeedButton(speedValue)
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText(/beats per minute/)).toBeVisible()
                    expect(screen.getByLabelText(/beats per minute/)).toHaveTextContent(
                        expectedBpm.toString()
                    )
                })
                it('should allow the user to set times for the loop', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickPlay()
                    await clickSetLoopButton()
                    clickLoopEditorAt(50, 50)
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('loop-line')).toBeVisible()
                    expect(screen.getByLabelText('loop-line-text')).toHaveTextContent('00:01:800')
                })
                it('should show a preview loop line on hover', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickPlay()
                    await clickSetLoopButton()
                    await hoverLoopEditorAt(50, 50)
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('loop-line')).toBeVisible()
                    expect(screen.getByLabelText('loop-line-text')).toHaveTextContent('00:02:800')
                })
            })

            describe('The extra settings', () => {
                it('should show a track list', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickExtraSettings()
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByText(/User Instrument/i)).toBeVisible()
                    expect(screen.getAllByAltText(/Acoustic Grand Keyboard/i)).toHaveLength(3) // default instrument
                    expect(screen.getByText(/hide all/i)).toBeVisible()
                })
                it('should let the user instrument be changed', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickExtraSettings()
                    changeUserInstrument('Ocarina')
                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByTestId('instrument-selector')).toHaveTextContent('Ocarina')
                    expect(screen.getByText(/User Instrument/i)).toBeVisible()
                })
                it('should hide the notes when the "show notes" switch is off', async () => {
                    render(<App />)

                    await clickMidiExample()
                    await clickExtraSettings()
                    await clickShowNotesSwitch()
                    await waitSoundFontInstrumentPromise()
                    await waitRequestMIDIAccessPromise()
                    await dispatchMidiInputMessageEvent(midiInput, 'A0')

                    expect(screen.queryByText('A0')).not.toBeInTheDocument()

                    await clickExtraSettings()
                    await clickShowNotesSwitch()

                    expect(screen.getByText('A0')).toBeInTheDocument()
                })
            })

            describe('The visualizer', () => {
                it('should render', async () => {
                    render(<App />)

                    await clickMidiExample()

                    const notes = screen.getAllByLabelText(/note/)
                    expect(notes.length).toBe(57)
                })
            })
        })
    })
})
