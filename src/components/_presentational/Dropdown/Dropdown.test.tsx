import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Dropdown } from './Dropdown'
import { DropdownItem } from '../DropdownItem'
import { DropdownToggle } from '../DropdownToggle'
import userEvent from '@testing-library/user-event'

describe('Dropdown', () => {
    it('should be closed when the `open` prop is false', async () => {
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
        await waitFor(() => expect(dropdownToggle).toBeInTheDocument())
        await waitFor(() => expect(dropdownContent).not.toBeInTheDocument())
    })
    it('should be open when the `open` prop is true', async () => {
        render(
            <Dropdown open={true}>
                <DropdownToggle>My dropdown</DropdownToggle>
                <DropdownItem>some content</DropdownItem>
            </Dropdown>
        )

        const dropdownToggle = screen.getByText(/dropdown/)
        const dropdownContent = screen.queryByText(/content/)

        await waitFor(() => expect(dropdownToggle).toBeInTheDocument())
        await waitFor(() => expect(dropdownContent).toBeInTheDocument())
    })
})
