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
})
