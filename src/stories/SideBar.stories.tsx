import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { SideBar } from '../components/_presentational/SideBar'

export default {
    title: 'Example/Sidebar',
    component: SideBar,
} as ComponentMeta<typeof SideBar>

const Template: ComponentStory<typeof SideBar> = (args) => (
    <SideBar {...args}> I am the content of the sidebar</SideBar>
)

export const Default = Template.bind({})
Default.args = {}
