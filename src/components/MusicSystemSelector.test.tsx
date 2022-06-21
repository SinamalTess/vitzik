import { screen, render } from '@testing-library/react'
import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import userEvent from '@testing-library/user-event'

describe('MusicSystemSelector', () => {
    const onChange = jest.fn()

    it('calls onChange() callback with "syllabic" mode', () => {
        render(
            <MusicSystemSelector
                musicSystem={'alphabetical'}
                onChange={onChange}
            ></MusicSystemSelector>
        )
        const button = screen.getByText(/Si/i)
        userEvent.click(button)

        expect(onChange).toHaveBeenCalledWith('syllabic')
    })

    it('calls onChange() callback with "german" mode', () => {
        render(
            <MusicSystemSelector
                musicSystem={'alphabetical'}
                onChange={onChange}
            ></MusicSystemSelector>
        )
        const button = screen.getByText(/H/i)
        userEvent.click(button)

        expect(onChange).toHaveBeenCalledWith('german')
    })

    it('calls onChange() callback with "alphabetical" mode', () => {
        render(
            <MusicSystemSelector musicSystem={'german'} onChange={onChange}></MusicSystemSelector>
        )
        const button = screen.getByText(/B/i)
        userEvent.click(button)

        expect(onChange).toHaveBeenCalledWith('alphabetical')
    })
})
