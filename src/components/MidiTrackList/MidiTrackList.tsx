import React from 'react'
import { ListItem } from '../generics/ListItem'
import { ListItemSecondaryAction } from '../generics/ListItemSecondaryAction'
import { Button } from '../generics/Button'
import { List } from '../generics/List'
import { Icon } from '../generics/Icon'
import { Instrument, TrackMetas } from '../../types'
import { Divider } from '../generics/Divider'
import './MidiTrackList.scss'
import { instrumentToIcon } from '../../utils/instruments'

interface MidiTrackListProps {
    playableTracks: TrackMetas[]
    activeTracks: number[]
    initialInstruments: Instrument[]
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
}

function getInstrument(channel: number, initialInstruments: Instrument[]) {
    return initialInstruments.find((instrument) => instrument.channel === channel)
}

export function MidiTrackList({
    playableTracks,
    activeTracks,
    initialInstruments,
    onChangeActiveTracks,
}: MidiTrackListProps) {
    const allChecked = activeTracks.length === playableTracks.length
    const playableTracksIndexes = playableTracks.map(({ index }) => index)

    function selectAllPlayableTracks() {
        onChangeActiveTracks([...playableTracksIndexes])
    }

    function unselectAllPlayableTracks() {
        onChangeActiveTracks([])
    }

    function selectTrack(track: number) {
        const existingTrackIndex = activeTracks.findIndex((activeTrack) => activeTrack === track)
        if (existingTrackIndex >= 0) {
            const newActiveTracks = [...activeTracks]
            newActiveTracks.splice(existingTrackIndex, 1)
            onChangeActiveTracks(newActiveTracks)
        } else {
            onChangeActiveTracks([...activeTracks, track])
        }
    }

    function handleChange(value: number | string) {
        if (value === 'all' && !allChecked) {
            selectAllPlayableTracks()
        } else if (value === 'all') {
            unselectAllPlayableTracks()
        } else {
            // @ts-ignore
            selectTrack(value)
        }
    }

    return (
        <List className="track-list">
            <ListItem>
                <ListItemSecondaryAction>
                    <Button
                        icon={allChecked ? 'eye-closed' : 'eye-open'}
                        onClick={() => handleChange('all')}
                    >
                        {allChecked ? 'Hide All' : 'Show all'}
                    </Button>
                </ListItemSecondaryAction>
            </ListItem>
            {playableTracks
                ? playableTracks.map(({ index, channels, names }) => {
                      const isActiveTrack = activeTracks.some(
                          (activeTrack) => activeTrack === index
                      )
                      return (
                          <ListItem key={index}>
                              <ListItemSecondaryAction>
                                  <span className="track-index">{index}</span>
                                  <Button
                                      icon={isActiveTrack ? 'eye-open' : 'eye-closed'}
                                      onClick={() => handleChange(index)}
                                  />
                              </ListItemSecondaryAction>
                              <Divider orientation="vertical" />
                              <span className="track-names">{names?.join('')}</span>
                              <Divider orientation="vertical" />
                              <List type="transparent">
                                  {channels.map((channel) => {
                                      const instrument = getInstrument(channel, initialInstruments)
                                      if (instrument) {
                                          return (
                                              <ListItem key={index + channel}>
                                                  <ListItemSecondaryAction>
                                                      <span
                                                          className={`channel channel-${channel}`}
                                                      >
                                                          CH : {channel}
                                                      </span>
                                                  </ListItemSecondaryAction>
                                                  <Icon
                                                      size={18}
                                                      name={instrumentToIcon(instrument.name)}
                                                  />
                                                  {instrument.name}
                                              </ListItem>
                                          )
                                      } else {
                                          return null
                                      }
                                  })}
                              </List>
                          </ListItem>
                      )
                  })
                : null}
        </List>
    )
}
