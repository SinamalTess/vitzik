import { fireEvent, screen } from '@testing-library/react'

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

export const clickMidiExample = async () => {
    const button = screen.getByText(/Example/i)
    /*
        Can't use userEvent.click() here because the button will remain focused.
        In tests when we then execute a shortcut such as {space} after, this will cause a second click.
        In the real environment the button disappears from the layout so this doesn't happen.
    */
    fireEvent.click(button)
    await screen.findAllByLabelText(/note/)
}
