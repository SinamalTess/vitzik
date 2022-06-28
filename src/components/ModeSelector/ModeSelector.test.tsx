import { screen, render } from '@testing-library/react'
import React from 'react'
import { ModeSelector } from './'
import userEvent from '@testing-library/user-event'

describe('ModeSelector', () => {
    const onChange = jest.fn()

    it('should call onChange() callback with "learning" mode', () => {
        render(<ModeSelector appMode={'import'} onChange={onChange}></ModeSelector>)
        const button = screen.getByText(/learning/i)
        userEvent.click(button)

        expect(onChange).toHaveBeenCalledWith('learning')
    })

    it('should call onChange() callback with "import" mode', () => {
        render(<ModeSelector appMode={'learning'} onChange={onChange}></ModeSelector>)
        const button = screen.getByText(/import/i)
        userEvent.click(button)

        expect(onChange).toHaveBeenCalledWith('import')
    })
})