import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const clickLearningMode = async () => {
    const button = screen.getByText(/music theory/i)
    await userEvent.click(button)
}

export const clickImportMode = async () => {
    const button = screen.getByText(/import/i)
    await userEvent.click(button)
}
