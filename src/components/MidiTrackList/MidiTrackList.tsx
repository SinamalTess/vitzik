import React from 'react'
import { ListItem } from '../_presentational/ListItem'
import { ListItemSecondaryAction } from '../_presentational/ListItemSecondaryAction'
import { Button } from '../_presentational/Button'
import { List } from '../_presentational/List'
import { Instrument, TrackMetas } from '../../types'
import { Divider } from '../_presentational/Divider'
import './MidiTrackList.scss'
import { msToTime } from '../../utils'
import { Tooltip } from '../_presentational/Tooltip'

interface MidiTrackListProps {
    tracks: TrackMetas[]
    activeTracks: number[]
    instruments: Instrument[]
    activeInstruments: Instrument[]
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
}

const BASE_CLASS = 'midi-track-list'

function getChannelInstruments(
    channel: number,
    instruments: Instrument[],
    activeInstruments: Instrument[]
) {
    const isInstrumentActive = (instrument: Instrument) =>
        activeInstruments.some(
            ({ timestamp, name, channel }) =>
                timestamp === instrument.timestamp &&
                name === instrument.name &&
                channel === instrument.channel
        )

    return instruments
        .filter((instrument) => instrument.channel === channel)
        .map((instrument) => ({
            ...instrument,
            isActive: isInstrumentActive(instrument),
        }))
}

function getListItem(
    playableTracks: TrackMetas[],
    instruments: Instrument[],
    activeTracks: number[],
    activeInstruments: Instrument[]
) {
    return playableTracks.map(({ channels, index, names }) => {
        // turns Set into Array
        const channelsInstruments = [...channels].reduce(
            (acc, val) => acc.concat(getChannelInstruments(val, instruments, activeInstruments)),
            [] as any[]
        )

        const isActiveTrack = activeTracks.some((activeTrack) => activeTrack === index)

        return {
            index,
            names,
            channelsInstruments,
            isActiveTrack,
        }
    })
}

export function MidiTrackList({
    tracks,
    activeTracks,
    instruments,
    activeInstruments,
    onChangeActiveTracks,
}: MidiTrackListProps) {
    const playableTracks = tracks.filter((track) => track.isPlayable)
    const allChecked = activeTracks.length === playableTracks.length
    const playableTracksIndexes = playableTracks.map(({ index }) => index)

    const listItem = getListItem(playableTracks, instruments, activeTracks, activeInstruments)

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
        <List className={BASE_CLASS}>
            <ListItem>
                <ListItemSecondaryAction>
                    <Button
                        size={'sm'}
                        icon={allChecked ? 'eye-closed' : 'eye-open'}
                        onClick={() => handleChange('all')}
                    >
                        {allChecked ? 'Hide All' : 'Show all'}
                    </Button>
                </ListItemSecondaryAction>
            </ListItem>
            {playableTracks
                ? listItem.map(({ index, names, channelsInstruments, isActiveTrack }) => {
                      return (
                          <ListItem key={index}>
                              <ListItemSecondaryAction>
                                  <span className={`${BASE_CLASS}__track-index`}>{index}</span>
                                  <Button
                                      icon={isActiveTrack ? 'eye-open' : 'eye-closed'}
                                      onClick={() => handleChange(index)}
                                  />
                              </ListItemSecondaryAction>
                              <Divider orientation="vertical" />
                              <span>{names?.join('')}</span>
                              <Divider orientation="vertical" />
                              <List variant="transparent">
                                  {channelsInstruments.map(
                                      ({ channel, isActive, timestamp, name }) => (
                                          <ListItem key={index + channel + timestamp}>
                                              <Tooltip showOnHover>
                                                  <span
                                                      className={
                                                          isActive
                                                              ? `channel channel--${channel}`
                                                              : 'channel'
                                                      }
                                                  >
                                                      CH : {channel}
                                                  </span>
                                                  <span>starting time : {msToTime(timestamp)}</span>
                                              </Tooltip>
                                              <img
                                                  src={`img/svg/instruments/instrument_${name}.svg`}
                                                  alt={`instrument ${name}`}
                                                  style={{ width: 24 }}
                                              />
                                              {name}
                                          </ListItem>
                                      )
                                  )}
                              </List>
                          </ListItem>
                      )
                  })
                : null}
        </List>
    )
}
