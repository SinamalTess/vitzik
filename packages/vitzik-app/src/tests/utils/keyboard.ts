import { fireEvent, screen } from '@testing-library/react'
import { AlphabeticalNote } from '../../types'
import userEvent from '@testing-library/user-event'

export const clickKey = async (name: AlphabeticalNote) => {
    const key = screen.getByTestId(name)
    await userEvent.click(key)
}

export const touchKey = (name: AlphabeticalNote) => {
    const key = screen.getByTestId(name)
    fireEvent.touchStart(key)
}
