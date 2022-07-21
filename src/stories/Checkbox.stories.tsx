import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { Checkbox } from '../components/_presentational/Checkbox'

export default {
    title: 'Example/Checkbox',
    component: Checkbox,
} as ComponentMeta<typeof Checkbox>

const Template: ComponentStory<typeof Checkbox> = (args) => <Checkbox {...args}>Click me</Checkbox>

export const Default = Template.bind({})
Default.args = {}
