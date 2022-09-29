import { List, ListItem, SVGRectangle, Tooltip } from 'vitzik-ui'
import React from 'react'
import { NoteEvent } from '../../classes/NoteEvent'

const RADIUS = 5

interface NoteProps {
    showDebugInfos?: boolean
    event: NoteEvent
    opacity?: number
}

export function Note({ showDebugInfos = false, event, opacity = 1 }: NoteProps) {
    const { x, y, w, h } = event.coordinates
    const { name, channel } = event.note

    const props = {
        'aria-label': `${name} note`,
        className: `channel--${channel}`,
        opacity,
        x,
        y,
        rx: RADIUS,
        ry: RADIUS,
        w,
        h,
    }

    return showDebugInfos ? (
        <Tooltip showOnHover strategy={'fixed'} placement={'right'}>
            <SVGRectangle {...props} />
            <List variant={'transparent'}>
                {Object.entries(event).map(([key, value], k) => {
                    return <ListItem key={k}>{`${key} : ${value}`}</ListItem>
                })}
            </List>
        </Tooltip>
    ) : (
        <SVGRectangle {...props} />
    )
}
