import { render, screen } from '@testing-library/react'
import React from 'react'
import { Button } from './Button'

describe('Button', () => {
    it('displays inner text', () => {
        render(<Button>Click me</Button>)

        expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })
})
