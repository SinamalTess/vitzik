import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { ButtonGroup } from '../components/ButtonGroup'
import { Button } from '../components/Button'

export default {
    title: 'Example/ButtonGroup',
    component: ButtonGroup,
} as ComponentMeta<typeof ButtonGroup>

const Template: ComponentStory<typeof ButtonGroup> = (args) => (
    <ButtonGroup {...args}>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
    </ButtonGroup>
)

export const Default = Template.bind({})
Default.args = {}
