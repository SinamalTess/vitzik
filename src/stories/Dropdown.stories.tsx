import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { Dropdown } from '../components/_presentational/Dropdown'
import { DropdownToggle } from '../components/_presentational/DropdownToggle'
import { DropdownItem } from '../components/_presentational/DropdownItem'

export default {
    title: 'Example/Dropdown',
    component: Dropdown,
} as ComponentMeta<typeof Dropdown>

const Template: ComponentStory<typeof Dropdown> = (args) => (
    <Dropdown {...args}>
        <DropdownToggle>Click me</DropdownToggle>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownItem>Item 2</DropdownItem>
        <DropdownItem>Item 3</DropdownItem>
    </Dropdown>
)

export const Default = Template.bind({})
Default.args = {}
