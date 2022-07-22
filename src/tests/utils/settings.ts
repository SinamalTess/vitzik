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

export const selectInstrument = (newInstrument: InstrumentUserFriendlyName) => {
    const select = screen.getByTestId('instrument-selector')
    fireEvent.change(select, { value: newInstrument })
}
