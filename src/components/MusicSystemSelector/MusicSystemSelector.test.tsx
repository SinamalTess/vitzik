import { screen, render } from '@testing-library/react'
import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import userEvent from '@testing-library/user-event'

const clickSyllabicSystem = () => {
    const button = screen.getByText(/syllabic/i)
    userEvent.click(button)
}

const clickGermanSystem = () => {
    const button = screen.getByText(/german/i)
    userEvent.click(button)
}

const clickAlphabeticalSystem = () => {
    const button = screen.getByText(/alphabetical/i)
    userEvent.click(button)
}

describe('MusicSystemSelector', () => {
    const onChange = jest.fn()

    it('calls onChange() callback with "syllabic" mode', () => {
        render(
            <MusicSystemSelector
                musicSystem={'alphabetical'}
                onChange={onChange}
            ></MusicSystemSelector>
        )

        clickSyllabicSystem()

        expect(onChange).toHaveBeenCalledWith('syllabic')
    })

    it('calls onChange() callback with "german" mode', () => {
        render(
            <MusicSystemSelector
                musicSystem={'alphabetical'}
                onChange={onChange}
            ></MusicSystemSelector>
        )

        clickGermanSystem()

        expect(onChange).toHaveBeenCalledWith('german')
    })

    it('calls onChange() callback with "alphabetical" mode', () => {
        render(
            <MusicSystemSelector musicSystem={'german'} onChange={onChange}></MusicSystemSelector>
        )

        clickAlphabeticalSystem()

        expect(onChange).toHaveBeenCalledWith('alphabetical')
    })
})
