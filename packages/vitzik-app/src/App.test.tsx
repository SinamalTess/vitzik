import { screen, render, act } from '@testing-library/react'
import React, { ReactNode } from 'react'
import App from './App'
import { midiAccessMock, requestMIDIAccess, MidiInputMock } from './tests/mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import {
    clickBpmButton,
    clickSpeedButton,
    clickExtraSettings,
    clickSetLoopButton,
    clickPlay,
    clickLoopEditorAt,
    clickVolume,
    pressKey,
    changeUserInstrument,
    clickMidiExample,
    dispatchMidiInputMessageEvent,
    clickStop,
    clickPause,
    hoverLoopEditorAt,
    clickAutoplaySwitch,
    clickShowNotesSwitch,
} from './tests/utils'
import { instrumentPlayerMock } from './tests/mocks/SoundFont'

jest.mock('soundfont-player', () => ({
    instrument: jest.fn(),
}))

jest.mock('midi-json-parser', () => () => {})

jest.mock('./components/_hocs/WithContainerDimensions', () => ({
    WithContainerDimensions: (Component: any) => (props: any) => {
        return <Component {...props} height={100} width={200} />
    },
}))

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

        it('should not show any midi input selector', async () => {
            render(<App />)

            await waitSoundFontInstrumentPromise()

            expect(screen.getByText(/Import Midi/i)).toBeVisible()
            expect(screen.getByText(/Music theory/i)).toBeDisabled()
            expect(screen.getByText(/no input/i)).toBeVisible()
        })
    })

    describe('When there is a midi input', () => {
        beforeEach(async () => {
            requestMIDIAccess.mockResolvedValue(midiAccessMock([midiInput]))
            jest.spyOn(Soundfont, 'instrument').mockResolvedValue(instrumentPlayerMock)
        })

        describe('When no midi file is imported yet', () => {
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
            it('should render the initial state', async () => {
                render(<App />)

                await waitSoundFontInstrumentPromise()

                expect(screen.getByText(/Import Midi/i)).toBeVisible()
                expect(screen.getByText(/Music theory/i)).toBeVisible()
                expect(screen.getByText(/Piano - Yamaha/i)).toBeVisible()
                expect(screen.getByLabelText(/settings/)).toBeVisible()
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
                it('should show the first Bpm value', async () => {
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
        })
    })
})
