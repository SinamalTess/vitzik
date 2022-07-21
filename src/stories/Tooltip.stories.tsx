import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Tooltip } from '../components/_presentational/Tooltip'

export default {
    title: 'Example/Tooltip',
    component: Tooltip,
} as ComponentMeta<typeof Tooltip>

const Template: ComponentStory<typeof Tooltip> = (args) => (
    <Tooltip {...args}>
        <span>I have a tooltip</span>
        <span>The content of the tooltip</span>
    </Tooltip>
)

export const Default = Template.bind({})
Default.args = {}
