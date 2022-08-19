import { render, screen } from '@testing-library/react'
import React from 'react'
import { ButtonGroup } from './ButtonGroup'
import { Button } from '../Button'

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
            expect(button).toHaveClass('btn-sm')
        })
    })
    it('should show an error when no children are passed', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation(() => {})
        // @ts-ignore (no children is intended for the test)
        render(<ButtonGroup></ButtonGroup>)

        expect(consoleMock).toBeCalledWith('<ButtonGroup> was not passed any children')
    })
    it('should show an error when the children are not an array', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <ButtonGroup>
                <Button>Hello</Button>
            </ButtonGroup>
        )

        expect(consoleMock).toBeCalledWith('<ButtonGroup> expected an array of children')
    })
})
