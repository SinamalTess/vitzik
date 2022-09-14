import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstrumentUserFriendlyName } from '../../types'

export const clickShowNotesSwitch = async () => {
    const button = screen.getByLabelText(/show notes/i)
    await userEvent.click(button)
}

export const changeUserInstrument = (newInstrument: InstrumentUserFriendlyName) => {
    const select = screen.getByTestId('instrument-selector')
    fireEvent.change(select, { value: newInstrument })
}
