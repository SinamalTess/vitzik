import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstrumentUserFriendlyName } from '../../types'

export const clickExtraSettings = async () => {
    const button = screen.getByLabelText(/settings/)
    await userEvent.click(button)
}

export const clickBPMButton = async () => {
    const button = screen.getByLabelText(/beats per minute/)
    await userEvent.click(button)
}

export const clickSpeedButton = async (newSpeedValue: number) => {
    const button = screen.getByText(`x${newSpeedValue}`)
    await userEvent.click(button)
}

export const clickSetLoopButton = async () => {
    const button = screen.getByLabelText(/loop/)
    await userEvent.click(button)
}

export const clickLoopEditorAt = (clientX: number, clientY: number) => {
    const loopEditor = screen.getByTestId('loop-editor')
    fireEvent.click(loopEditor, { clientX, clientY })
}

export const hoverLoopEditorAt = async (clientX: number, clientY: number) => {
    const loopEditor = screen.getByTestId('loop-editor')
    // @ts-ignore
    await userEvent.hover(loopEditor, { clientX, clientY })
}

export const clickMidiModeSwitch = async () => {
    const button = screen.getByRole('switch')
    await userEvent.click(button)
}

export const clickAutoplaySwitch = async () => {
    const button = screen.getByLabelText(/autoplay/i)
    await userEvent.click(button)
}

export const clickShowNotesSwitch = async () => {
    const button = screen.getByLabelText(/show notes/i)
    await userEvent.click(button)
}

export const changeUserInstrument = (newInstrument: InstrumentUserFriendlyName) => {
    const select = screen.getByTestId('instrument-selector')
    fireEvent.change(select, { value: newInstrument })
}
