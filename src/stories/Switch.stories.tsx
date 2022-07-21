import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Switch } from '../components/_presentational/Switch'

export default {
    title: 'Example/Switch',
    component: Switch,
} as ComponentMeta<typeof Switch>

const Template: ComponentStory<typeof Switch> = (args) => <Switch {...args}>Switch me</Switch>

export const Default = Template.bind({})
Default.args = {}
