import React, { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import { useClickOutside } from './useClickOutside'
import userEvent from '@testing-library/user-event'

interface MyComponentProps {
    shouldListen: boolean
}

const clickInside = async () => {
    const button = screen.getByTestId(/inside/)
    await userEvent.click(button)
}

const clickOutside = async () => {
    const button = screen.getByTestId(/outside/)
    await userEvent.click(button)
}

const onClickOutside = jest.fn()

function MyComponent({ shouldListen }: MyComponentProps) {
    const ref = useRef(null)

    useClickOutside([ref], onClickOutside, shouldListen)

    return (
        <div data-testid={'outside-container'}>
            <div ref={ref} data-testid={'inside-container'}>
                My component is awesome
            </div>
        </div>
    )
}

describe('useClickOutside()', () => {
    describe('When the "shouldListen" is "true"', () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('should listen to outside clicks', async () => {
            render(<MyComponent shouldListen />)

            await clickOutside()

            expect(onClickOutside).toHaveBeenCalled()
        })
        it('should not listen to inside clicks', async () => {
            render(<MyComponent shouldListen />)

            await clickInside()

            expect(onClickOutside).not.toHaveBeenCalled()
        })
    })
    describe('When "shouldListen" is "false"', () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('should not listen to outside clicks', async () => {
            render(<MyComponent shouldListen={false} />)

            await clickOutside()

            expect(onClickOutside).not.toHaveBeenCalled()
        })
        it('should not listen to inside clicks', async () => {
            render(<MyComponent shouldListen={false} />)

            await clickInside()

            expect(onClickOutside).not.toHaveBeenCalled()
        })
    })
})
