import React from 'react'
// @ts-ignore
import { Tooltip, Divider, ListItem, ListItemSecondaryAction, Button, List } from 'vitzik-ui'
import { Instrument, InstrumentUserFriendlyName, TrackMetas } from '../../types'
import './MidiTrackList.scss'
import { ChannelList } from './ChannelList'

interface MidiTrackListProps {
    tracks: TrackMetas[]
    activeTracks: number[]
    loadedInstrumentPlayers: InstrumentUserFriendlyName[]
    allInstruments: Instrument[]
    activeInstruments: Instrument[]
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
}

export interface ChannelInfos {
    isActive: boolean
    instrumentName: InstrumentUserFriendlyName
    instrumentState: 'pending' | 'loaded'
    timestamp: number
    channel: number
}

const BASE_CLASS = 'midi-track-list'

function getChannelInfos(
    channel: number,
    allInstruments: Instrument[],
    activeInstruments: Instrument[],
    loadedInstrumentPlayers: InstrumentUserFriendlyName[]
): ChannelInfos[] {
    const isInstrumentActive = (instrument: Instrument) =>
        activeInstruments.some(
            ({ timestamp, name, channel }) =>
                timestamp === instrument.timestamp &&
                name === instrument.name &&
                channel === instrument.channel
        )

    const getInstrumentState = (instrument: Instrument) => {
        const existingInstrumentPlayerIndex = loadedInstrumentPlayers.findIndex(
            (loadedInstrumentPlayer) => loadedInstrumentPlayer === instrument.name
        )
        return existingInstrumentPlayerIndex >= 0 ? 'loaded' : 'pending'
    }

    return allInstruments
        .filter((instrument) => instrument.channel === channel)
        .map((instrument) => {
            const { name: instrumentName, channel, timestamp } = instrument
            return {
                channel,
                instrumentName,
                timestamp,
                isActive: isInstrumentActive(instrument),
                instrumentState: getInstrumentState(instrument),
            }
        })
}

function getTrackInfos(
    playableTracks: TrackMetas[],
    allInstruments: Instrument[],
    activeTracks: number[],
    activeInstruments: Instrument[],
    loadedInstrumentPlayers: InstrumentUserFriendlyName[]
) {
    return playableTracks.map(({ channels, index, names }) => {
        // turns Set into Array
        const channelsInfos = [...channels].reduce(
            (acc, val) =>
                acc.concat(
                    getChannelInfos(val, allInstruments, activeInstruments, loadedInstrumentPlayers)
                ),
            [] as ChannelInfos[]
        )

        const isActive = activeTracks.some((activeTrack) => activeTrack === index)

        return {
            index,
            names,
            channelsInfos,
            isActive,
        }
    })
}

export function MidiTrackList({
    tracks,
    activeTracks,
    allInstruments,
    activeInstruments,
    loadedInstrumentPlayers,
    onChangeActiveTracks,
}: MidiTrackListProps) {
    const playableTracks = tracks.filter((track) => track.isPlayable)
    const allTracksChecked = activeTracks.length === playableTracks.length
    const playableTracksIndexes = playableTracks.map(({ index }) => index)

    const trackInfos = getTrackInfos(
        playableTracks,
        allInstruments,
        activeTracks,
        activeInstruments,
        loadedInstrumentPlayers
    )

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

    function handleClick(value: number | string) {
        if (value === 'all' && !allTracksChecked) {
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
                        variant={'outlined'}
                        icon={allTracksChecked ? 'eye-closed' : 'eye-open'}
                        onClick={() => handleClick('all')}
                    >
                        {allTracksChecked ? 'Hide All' : 'Show all'}
                    </Button>
                </ListItemSecondaryAction>
            </ListItem>
            {playableTracks
                ? trackInfos.map(({ index, names, channelsInfos, isActive }) => {
                      return (
                          <ListItem key={index}>
                              <ListItemSecondaryAction>
                                  <span className={`${BASE_CLASS}__track-index`}>{index}</span>
                                  <Button
                                      icon={isActive ? 'eye-open' : 'eye-closed'}
                                      onClick={() => handleClick(index)}
                                  />
                              </ListItemSecondaryAction>
                              <Divider variant={'vertical'} />
                              <div>
                                  {names.length ? (
                                      <Tooltip showOnHover placement={'right'}>
                                          <span className={`${BASE_CLASS}__track-name`}>
                                              {names?.join('')}
                                          </span>
                                          Track Name
                                      </Tooltip>
                                  ) : null}
                                  <ChannelList channels={channelsInfos} />
                              </div>
                          </ListItem>
                      )
                  })
                : null}
        </List>
    )
}
