import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Icon } from '../components/generics/Icon'

export default {
    title: 'Example/Icon',
    component: Icon,
} as ComponentMeta<typeof Icon>

const Template: ComponentStory<typeof Icon> = (args) => <Icon {...args} />

export const Default = Template.bind({})
Default.args = {}
