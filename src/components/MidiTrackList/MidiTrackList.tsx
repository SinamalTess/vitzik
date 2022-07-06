import React from 'react'
import { ListItem } from '../generics/ListItem'
import { ListItemSecondaryAction } from '../generics/ListItemSecondaryAction'
import { Button } from '../generics/Button'
import { List } from '../generics/List'
import {
    MIDI_CHANNEL_COLORS,
    MIDI_INSTRUMENTS,
    MIDI_INSTRUMENTS_FLUIDR3_GM,
} from '../../utils/const'
import { Icon } from '../generics/Icon'
import { Instrument, TrackMetas } from '../../types'
import { IconName } from '../generics/types'
import { Divider } from '../generics/Divider'

interface MidiTrackListProps {
    playableTracks: TrackMetas[]
    activeTracks: number[]
    initialInstruments: Instrument[]
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
}

function getInstrument(channel: number, initialInstruments: Instrument[]) {
    return initialInstruments.find((instrument) => instrument.channel === channel)
}

function getInstrumentIcon(instrument: Instrument): IconName {
    const InstrumentIndex = MIDI_INSTRUMENTS.findIndex(
        (midiInstrument) => midiInstrument === instrument.name
    )
    return ('instrument-' +
        MIDI_INSTRUMENTS_FLUIDR3_GM[InstrumentIndex].toLowerCase().replace(/_/g, '-')) as IconName
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
                          <ListItem>
                              <ListItemSecondaryAction>
                                  <span className="track-index">{index}</span>
                                  <Button
                                      icon={isActiveTrack ? 'eye-open' : 'eye-closed'}
                                      onClick={() => handleChange(index)}
                                  />
                              </ListItemSecondaryAction>
                              <Divider orientation="vertical" />
                              <span>{names?.join('')}</span>
                              <List type="transparent">
                                  {channels.map((channel) => {
                                      const intrument = getInstrument(channel, initialInstruments)
                                      if (intrument) {
                                          return (
                                              <ListItem>
                                                  <ListItemSecondaryAction>
                                                      <span
                                                          style={{
                                                              backgroundColor:
                                                                  MIDI_CHANNEL_COLORS[channel],
                                                          }}
                                                          className="channel"
                                                      >
                                                          CH : {channel}
                                                      </span>
                                                  </ListItemSecondaryAction>
                                                  <Icon
                                                      size={18}
                                                      name={getInstrumentIcon(intrument)}
                                                  />
                                                  {intrument.name}
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
