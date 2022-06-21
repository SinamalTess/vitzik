import { screen, render } from '@testing-library/react'
import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'

function BrokenComponent() {
    throw new Error('this component is broken')
    // eslint-disable-next-line no-unreachable
    return <h1>This won't show</h1>
}

describe('ErrorBoundary', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('should catch and display errors', () => {
        render(
            <ErrorBoundary>
                <BrokenComponent />
            </ErrorBoundary>
        )

        const text = screen.getByText(/something went wrong/i)
        const error = screen.getByText(/this component is broken/i)

        expect(text).toBeVisible()
        expect(error).toBeVisible()
    })
})
