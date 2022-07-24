import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const clickLearningMode = () => {
    const button = screen.getByText(/music theory/i)
    userEvent.click(button)
}

export const clickImportMode = () => {
    const button = screen.getByText(/import/i)
    userEvent.click(button)
}
