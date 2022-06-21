import { render, screen } from '@testing-library/react'
import React from 'react'
import { ButtonGroup } from './ButtonGroup'
import { Button } from './Button'

describe('ButtonGroup', () => {
    it('should pass provided size to children <Button />', () => {
        render(
            <ButtonGroup size={'sm'}>
                <Button>Hello</Button>
                <Button>There</Button>
            </ButtonGroup>
        )

        const buttons = screen.getAllByRole('button')

        buttons.forEach((button) => {
            expect(button).toHaveClass('btn--sm')
        })
    })
})
