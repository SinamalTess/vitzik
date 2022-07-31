import { screen, render } from '@testing-library/react'
import React from 'react'
import { MusicSystemSelector } from './MusicSystemSelector'
import userEvent from '@testing-library/user-event'

const clickSyllabicSystem = async () => {
    const button = screen.getByText(/syllabic/i)
    await userEvent.click(button)
}

const clickGermanSystem = async () => {
    const button = screen.getByText(/german/i)
    await userEvent.click(button)
}

const clickAlphabeticalSystem = async () => {
    const button = screen.getByText(/alphabetical/i)
    await userEvent.click(button)
}

describe('MusicSystemSelector', () => {
    const onChange = jest.fn()

    it('calls onChange() callback with "syllabic" mode', async () => {
        render(
            <MusicSystemSelector
                musicSystem={'alphabetical'}
                onChange={onChange}
            ></MusicSystemSelector>
        )

        await clickSyllabicSystem()

        expect(onChange).toHaveBeenCalledWith('syllabic')
    })

    it('calls onChange() callback with "german" mode', async () => {
        render(
            <MusicSystemSelector
                musicSystem={'alphabetical'}
                onChange={onChange}
            ></MusicSystemSelector>
        )

        await clickGermanSystem()

        expect(onChange).toHaveBeenCalledWith('german')
    })

    it('calls onChange() callback with "alphabetical" mode', async () => {
        render(
            <MusicSystemSelector musicSystem={'german'} onChange={onChange}></MusicSystemSelector>
        )

        await clickAlphabeticalSystem()

        expect(onChange).toHaveBeenCalledWith('alphabetical')
    })
})
