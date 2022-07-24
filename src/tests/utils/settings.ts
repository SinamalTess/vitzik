import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstrumentUserFriendlyName } from '../../types'

export const clickExtraSettings = () => {
    const button = screen.getByLabelText(/settings/)
    userEvent.click(button)
}

export const clickBPMButton = () => {
    const button = screen.getByLabelText(/beats per minute/)
    userEvent.click(button)
}

export const clickSpeedButton = (newSpeedValue: number) => {
    const button = screen.getByText(`x${newSpeedValue}`)
    userEvent.click(button)
}

export const clickSetLoopButton = () => {
    const button = screen.getByLabelText(/loop/)
    userEvent.click(button)
}

export const clickLoopEditorAt = (clientX: number, clientY: number) => {
    const loopEditor = screen.getByTestId('loop-editor')
    fireEvent.click(loopEditor, { clientX, clientY })
}

export const hoverLoopEditorAt = (clientX: number, clientY: number) => {
    const loopEditor = screen.getByTestId('loop-editor')
    userEvent.hover(loopEditor, { clientX, clientY })
}

export const clickMidiModeSwitch = () => {
    const button = screen.getByRole('switch')
    userEvent.click(button)
}

export const clickAutoplaySwitch = () => {
    const button = screen.getByLabelText(/autoplay/i)
    userEvent.click(button)
}

export const clickShowNotesSwitch = () => {
    const button = screen.getByLabelText(/show notes/i)
    userEvent.click(button)
}

export const changeUserInstrument = (newInstrument: InstrumentUserFriendlyName) => {
    const select = screen.getByTestId('instrument-selector')
    fireEvent.change(select, { value: newInstrument })
}
