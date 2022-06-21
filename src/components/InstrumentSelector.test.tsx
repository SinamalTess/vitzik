import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { InstrumentSelector } from './InstrumentSelector'

describe('InstrumentSelector', () => {
    test('returns the selected instrument to onChange() callback', () => {
        const onChange = jest.fn()
        render(<InstrumentSelector onChange={onChange}></InstrumentSelector>)
        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: 'Celesta' } })

        expect(onChange).toHaveBeenCalledWith('Celesta')
    })
})
