import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Select } from '../components/Select'

export default {
    title: 'Example/Select',
    component: Select,
} as ComponentMeta<typeof Select>

const Template: ComponentStory<typeof Select> = (args) => <Select {...args}>Click me</Select>

export const Default = Template.bind({})
Default.args = {}
