import { render, screen } from '@testing-library/react'
import React from 'react'
import { TextField } from './TextField'

const props = {
    value: 'I am a text field',
    onChange: jest.fn(),
}

describe('TextField', () => {
    it('should display the text value passed', () => {
        render(<TextField {...props}></TextField>)
        const button = screen.getByRole('textbox')

        expect(button).toHaveValue('I am a text field')
    })
})
