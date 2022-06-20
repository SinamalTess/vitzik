import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { RangeSlider } from './RangeSlider'

describe('RangeSlider', () => {
    test('returns the current value to onChange() callback', () => {
        const onChange = jest.fn()
        render(<RangeSlider onChange={onChange} value={30}></RangeSlider>)
        const input = screen.getByRole('slider')
        fireEvent.change(input, { target: { value: 50 } })

        expect(onChange).toHaveBeenCalledWith(50)
    })
})
