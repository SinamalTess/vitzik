import { render, screen } from '@testing-library/react'
import React from 'react'
import { Button } from './Button'

describe('Button', () => {
    describe('When a text is passed', () => {
        it('should display the text', () => {
            render(<Button>Click me</Button>)
            const button = screen.getByRole('button')

            expect(button).toHaveTextContent('Click me')
        })
    })
    describe('When the "icon" prop is passed', () => {
        it('should display the icon', () => {
            render(<Button icon={'loop'}></Button>)
            const icon = screen.getByLabelText(/icon/)

            expect(icon).toHaveClass('icon-loop')
        })
    })
})
