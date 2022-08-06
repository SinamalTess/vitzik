import { ListItem } from '../_presentational/ListItem'
import { Tooltip } from '../_presentational/Tooltip'
import { msToTime } from '../../utils'
import { InstrumentImage } from '../InstrumentImage'
import { Loader } from '../_presentational/Loader/Loader'
import { List } from '../_presentational/List'
import React from 'react'
import { ChannelInfos } from './MidiTrackList'

interface ChannelListProp {
    channels: ChannelInfos[]
}

export function ChannelList({ channels }: ChannelListProp) {
    return (
        <List variant="transparent">
            {channels.map(({ channel, isActive, timestamp, instrumentName, instrumentState }) => (
                <ListItem key={channel + timestamp}>
                    <Tooltip showOnHover>
                        <span className={isActive ? `channel channel--${channel}` : 'channel'}>
                            CH : {channel}
                        </span>
                        <span>starting time : {msToTime(timestamp)}</span>
                    </Tooltip>
                    <InstrumentImage instrumentName={instrumentName} />
                    {instrumentName}
                    {isActive && instrumentState !== 'loaded' ? <Loader /> : null}
                </ListItem>
            ))}
        </List>
    )
}
