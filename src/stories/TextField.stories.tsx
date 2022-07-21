import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { TextField } from '../components/_presentational/TextField'

export default {
    title: 'Example/TextField',
    component: TextField,
} as ComponentMeta<typeof TextField>

const Template: ComponentStory<typeof TextField> = (args) => <TextField {...args} />

export const Default = Template.bind({})
Default.args = {}
