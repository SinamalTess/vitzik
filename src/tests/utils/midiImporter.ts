import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const validFile = {
    dataTransfer: {
        items: [
            new File(['(⌐□_□)'], 'midi-track.midi', {
                type: 'audio/mid',
            }),
        ],
    },
}

const invalidFile = {
    dataTransfer: {
        items: [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })],
    },
}

export const dragValidFile = () => {
    const dropzone = screen.getByText(/dropzone/)
    fireEvent.dragOver(dropzone, { ...validFile })
}

export const dragInvalidFile = () => {
    const dropzone = screen.getByText(/dropzone/)
    fireEvent.dragOver(dropzone, { ...invalidFile })
}

export const clickMidiExample = () => {
    const button = screen.getByText(/Example/i)
    userEvent.click(button)
}

export const dropValidFile = () => {
    const dropzone = screen.getByText(/dropzone/)
    fireEvent.drop(dropzone, { ...validFile })
}
