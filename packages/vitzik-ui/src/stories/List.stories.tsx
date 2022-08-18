import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { List } from '../components/List'
import { ListItemSecondaryAction } from '../components/ListItemSecondaryAction'
import { Button } from '../components/Button'
import { ListItem } from '../components/ListItem'

export default {
    title: 'Example/List',
    component: List,
} as ComponentMeta<typeof List>

const Template: ComponentStory<typeof List> = (args) => (
    <List {...args}>
        <ListItem>
            <ListItemSecondaryAction>
                <Button icon={'settings'}></Button>
            </ListItemSecondaryAction>
            I am a list item
        </ListItem>
        <ListItem>
            <ListItemSecondaryAction>
                <Button icon={'settings'}></Button>
            </ListItemSecondaryAction>
            I am another list item
        </ListItem>
    </List>
)

export const Default = Template.bind({})
Default.args = {}
