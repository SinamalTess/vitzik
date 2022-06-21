import { screen, render } from '@testing-library/react'
import React from 'react'
import { ModeSelector } from './ModeSelector'
import userEvent from '@testing-library/user-event'

describe('ModeSelector', () => {
    const onChange = jest.fn()

    test('calls onChange() callback with "learning" mode', () => {
        render(<ModeSelector appMode={'import'} onChange={onChange}></ModeSelector>)
        const button = screen.getByText(/learning/i)
        userEvent.click(button)
        expect(onChange).toHaveBeenCalledWith('learning')
    })

    test('calls onChange() callback with "import" mode', () => {
        render(<ModeSelector appMode={'learning'} onChange={onChange}></ModeSelector>)
        const button = screen.getByText(/import/i)
        userEvent.click(button)
        expect(onChange).toHaveBeenCalledWith('import')
    })
})
