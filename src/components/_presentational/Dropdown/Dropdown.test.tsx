import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Dropdown } from './Dropdown'
import { DropdownItem } from '../DropdownItem'
import { DropdownToggle } from '../DropdownToggle'

describe('Dropdown', () => {
    it('should show an error when no children are passed', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation(() => {})
        // @ts-ignore
        render(<Dropdown></Dropdown>)

        expect(consoleMock).toBeCalledWith('<Dropdown> was not passed any children')
    })
    it('should show an error when the children are not an array', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <Dropdown>
                <DropdownToggle>Hello</DropdownToggle>
            </Dropdown>
        )

        expect(consoleMock).toBeCalledWith('<Dropdown> expected an array of children')
    })
    describe('When the "open" prop is "false"', () => {
        it('should be closed', async () => {
            render(
                <Dropdown open={false}>
                    <DropdownToggle>My dropdown</DropdownToggle>
                    <DropdownItem>some content</DropdownItem>
                </Dropdown>
            )

            const dropdownToggle = screen.getByText(/dropdown/)
            const dropdownContent = screen.queryByText(/content/)

            /*
                When note using await waitFor() we get the following error :
                    Warning: An update to Tooltip inside a test was not wrapped in act(...).
                    When testing, code that causes React state updates should be wrapped into act(...)
                This is an issue with popper, see here : https://github.com/floating-ui/react-popper/issues/350
            */
            await waitFor(() => expect(dropdownToggle).toBeVisible())
            await waitFor(() => expect(dropdownContent).not.toBeInTheDocument())
        })
    })

    describe('When the "open" prop is "true"', () => {
        it('should be open', async () => {
            render(
                <Dropdown open={true}>
                    <DropdownToggle>My dropdown</DropdownToggle>
                    <DropdownItem>some content</DropdownItem>
                </Dropdown>
            )

            const dropdownToggle = screen.getByText(/dropdown/)
            const dropdownContent = screen.queryByText(/content/)

            await waitFor(() => expect(dropdownToggle).toBeVisible())
            await waitFor(() => expect(dropdownContent).toBeVisible())
        })
    })
})
