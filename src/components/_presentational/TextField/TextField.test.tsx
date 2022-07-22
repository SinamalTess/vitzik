import { render, screen } from '@testing-library/react'
import React from 'react'
import { TextField } from './TextField'

const props = {
    value: 'I am a text field',
    onChange: jest.fn(),
}

describe('TextField', () => {
    it('should display the text', () => {
        render(<TextField {...props}></TextField>)
        const button = screen.getByRole('textbox')

        expect(button).toHaveValue('I am a text field')
    })
    it('should display an icon when passed as a prop', () => {
        render(<TextField {...props} icon={'loop'}></TextField>)
        const icon = screen.getByLabelText(/icon/)

        expect(icon).toHaveClass('icon-loop')
    })
})
