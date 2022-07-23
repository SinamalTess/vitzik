import { screen, render, act, waitFor } from '@testing-library/react'
import React, { ReactNode } from 'react'
import App from './App'
import { requestMIDIAccess } from './tests/mocks/requestMIDIAccess'
import Soundfont from 'soundfont-player'
import {
    clickChangeMidiModeSwitch,
    clickBPM,
    clickBPMValue,
    clickExtraSettings,
    clickLoop,
    clickPlay,
    clickVisualizationAt,
    clickVolume,
    pressSpace,
    selectInstrument,
    clickProgressBarAt,
    clickMidiExample,
    dispatchMidiInputMessageEvent,
} from './tests/utils'
import { MidiInputMock } from './tests/mocks/midiInput'

interface TooltipProps {
    children: ReactNode
}

jest.mock('soundfont-player', () => ({
    instrument: jest.fn(),
}))

jest.mock('./components/_presentational/Tooltip', () => ({
    Tooltip: ({ children }: TooltipProps) => {
        return children
    },
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

const setMidiInput = (midiInput?: MidiInputMock) => {
    requestMIDIAccess.mockResolvedValue({
        inputs: {
            values: () => (midiInput ? [midiInput] : []),
        },
        outputs: {
            values: () => [],
        },
    })
}

const setSoundFontInstrument = () => {
    // @ts-ignore
    Soundfont.instrument.mockResolvedValue({
        listenToMidi: jest.fn(),
    })
}

describe('App', () => {
    describe('When there is no midi input', () => {
        beforeEach(() => {
            setMidiInput()
            setSoundFontInstrument()
        })

        it('should not show any midi input selector', async () => {
            render(<App />)

            await waitSoundFontInstrumentPromise()

            expect(screen.getByText(/Import Midi/i)).toBeVisible()
            expect(screen.getByText(/Music theory/i)).toBeVisible()
            expect(screen.getByText(/no input/i)).toBeVisible()
        })
    })

    describe('When there is a midi input', () => {
        beforeEach(async () => {
            setMidiInput(midiInput)
            setSoundFontInstrument()
        })

        describe('When no midi file is imported yet', () => {
            it('should listen to midi event', async () => {
                render(<App />)

                await waitRequestMIDIAccessPromise()
                dispatchMidiInputMessageEvent(midiInput, 'A0')
                await waitSoundFontInstrumentPromise()

                await waitFor(() => expect(screen.getByTestId('A0-active')).toBeInTheDocument())
            })
            it('should render the application initial state', async () => {
                render(<App />)

                await waitRequestMIDIAccessPromise()
                await waitSoundFontInstrumentPromise()

                expect(screen.getByText(/Import Midi/i)).toBeVisible()
                expect(screen.getByText(/Music theory/i)).toBeVisible()
                expect(screen.getByText(/Piano - Yamaha/i)).toBeVisible()
                expect(screen.getByLabelText(/settings/)).toBeVisible()
            })
            describe('When clicking on the settings button', () => {
                it('should open the extra settings sidebar', async () => {
                    render(<App />)
                    clickExtraSettings()

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByText(/User Instrument/i)).toBeVisible()
                    expect(screen.getByAltText(/Acoustic Grand Keyboard/i)).toBeVisible()
                })
            })
        })

        describe('When a midi file is imported', () => {
            describe('The audio player', () => {
                it('should render', async () => {
                    render(<App />)
                    clickMidiExample()

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByText('02:33')).toBeInTheDocument()
                    expect(screen.getByLabelText('volume')).toBeInTheDocument()
                    expect(screen.getByLabelText('stop')).toBeInTheDocument()
                    expect(screen.getByLabelText('paused')).toBeInTheDocument()
                })
                it('should mute when the volume button is clicked', async () => {
                    render(<App />)
                    clickMidiExample()
                    clickVolume()

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('muted')).toBeInTheDocument()
                })
                it('should play when the space bar is pressed', async () => {
                    render(<App />)
                    clickMidiExample()
                    pressSpace()

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('play')).toBeInTheDocument()
                })
                it('should pause when the space bar is pressed while the player was playing', async () => {
                    render(<App />)
                    clickMidiExample()
                    pressSpace()
                    pressSpace()

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('paused')).toBeInTheDocument()
                })
                it('should resume playing when the space bar is pressed while the player was paused', async () => {
                    render(<App />)
                    clickMidiExample()
                    pressSpace()
                    pressSpace()
                    pressSpace()

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('play')).toBeInTheDocument()
                })
            })

            describe('The settings', () => {
                it('should show the first BPM value', async () => {
                    render(<App />)
                    clickMidiExample()

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText(/beats per minute/)).toBeVisible()
                    expect(screen.getByLabelText(/beats per minute/)).toHaveTextContent('78')
                })
                it('should let the BPM value be changed', async () => {
                    const initialBPM = 78
                    const speedValue = 2
                    const expectedBPM = initialBPM * speedValue
                    render(<App />)
                    clickMidiExample()
                    clickBPM()
                    clickBPMValue(speedValue)

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText(/beats per minute/)).toBeVisible()
                    expect(screen.getByLabelText(/beats per minute/)).toHaveTextContent(
                        expectedBPM.toString()
                    )
                })
                it('should allow the user to set times for the loop', async () => {
                    render(<App />)
                    clickMidiExample()
                    clickPlay()
                    clickLoop()
                    clickVisualizationAt(50, 50)

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('loop-line')).toBeVisible()
                    expect(screen.getByLabelText('loop-line-text')).toHaveTextContent('00:01:800')
                })
            })

            describe('The visualizer', () => {
                it('should stop when the mode is `wait` and the next note is reached', async () => {
                    render(<App />)
                    clickMidiExample()
                    clickChangeMidiModeSwitch()
                    clickProgressBarAt(2510)
                    clickPlay()

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByLabelText('play')).toBeInTheDocument()
                })
            })

            describe('The extra settings', () => {
                it('should show a track list', async () => {
                    render(<App />)
                    clickMidiExample()
                    clickExtraSettings()

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByText(/User Instrument/i)).toBeVisible()
                    expect(screen.getByAltText(/Acoustic Grand Keyboard/i)).toBeVisible()
                    expect(screen.getByText(/hide all/i)).toBeVisible()
                    expect(screen.getByAltText(/Bright Acoustic Keyboard/i)).toBeVisible() // instrument
                    expect(screen.getByText('Piano')).toBeVisible() // track name
                })
                it('should let the user instrument be changed', async () => {
                    render(<App />)
                    clickMidiExample()
                    clickExtraSettings()
                    selectInstrument('Ocarina')

                    await waitSoundFontInstrumentPromise()

                    expect(screen.getByTestId('instrument-selector')).toHaveTextContent('Ocarina')
                    expect(screen.getByText(/User Instrument/i)).toBeVisible()
                    expect(screen.getByAltText(/Bright Acoustic Keyboard/i)).toBeVisible() // instrument
                    expect(screen.getByText('Piano')).toBeVisible() // track name
                })
            })
        })
    })
})
