import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { RangeSlider } from '../components/RangeSlider'

export default {
    title: 'Example/RangeSlider',
    component: RangeSlider,
} as ComponentMeta<typeof RangeSlider>

const Template: ComponentStory<typeof RangeSlider> = (args) => <RangeSlider {...args} />

export const Default = Template.bind({})
Default.args = {}
