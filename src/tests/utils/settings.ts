import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstrumentUserFriendlyName } from '../../types'

export const clickExtraSettings = () => {
    const button = screen.getByLabelText(/settings/)
    userEvent.click(button)
}

export const clickBPM = () => {
    const button = screen.getByLabelText(/beats per minute/)
    userEvent.click(button)
}

export const clickBPMValue = (newSpeedValue: number) => {
    const button = screen.getByText(`x${newSpeedValue}`)
    userEvent.click(button)
}

export const clickLoop = () => {
    const button = screen.getByLabelText(/loop/)
    userEvent.click(button)
}

export const clickVisualizationAt = (clientX: number, clientY: number) => {
    const loopEditor = screen.getByTestId('loop-editor')
    fireEvent.click(loopEditor, { clientX, clientY })
}

export const selectInstrument = (newInstrument: InstrumentUserFriendlyName) => {
    const select = screen.getByTestId('instrument-selector')
    fireEvent.change(select, { value: newInstrument })
}
