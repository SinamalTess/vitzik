import { SideBar, Switch } from 'vitzik-ui'
import { MusicSystemSelector } from '../MusicSystemSelector'
import { InstrumentSelector } from '../InstrumentSelector'
import React from 'react'
import { ActiveInstrument, InstrumentUserFriendlyName, MidiMetas, MusicSystem } from '@/types'
import './ExtraSettingsPanel.scss'
import { MidiTrackList } from '../MidiTrackList'
import { InstrumentImage } from '../InstrumentImage'

interface ExtraSettingsPanelProps {
    isOpen: boolean
    showNotes: boolean
    showDampPedal: boolean
    userInstrument: InstrumentUserFriendlyName
    musicSystem: MusicSystem
    midiMetas: MidiMetas | null
    activeTracks: number[]
    activeInstruments: ActiveInstrument[]
    onClose: () => void
    loadedInstrumentPlayers: InstrumentUserFriendlyName[]
    onChangeMusicSystem: (musicSystem: MusicSystem) => void
    onChangeActiveTracks: React.Dispatch<React.SetStateAction<number[]>>
    onChangeInstrument: React.Dispatch<React.SetStateAction<ActiveInstrument[]>>
    onChangeShowNotes: React.Dispatch<React.SetStateAction<boolean>>
    onChangeShowDampPedal: React.Dispatch<React.SetStateAction<boolean>>
}

const BASE_CLASS = 'extra-settings'

export function ExtraSettingsPanel({
    isOpen,
    showNotes,
    showDampPedal,
    userInstrument,
    musicSystem,
    midiMetas,
    activeTracks,
    activeInstruments,
    loadedInstrumentPlayers,
    onClose,
    onChangeMusicSystem,
    onChangeActiveTracks,
    onChangeInstrument,
    onChangeShowNotes,
    onChangeShowDampPedal,
}: ExtraSettingsPanelProps) {
    function handleClickShowNotes() {
        onChangeShowNotes((showNotes) => !showNotes)
    }

    function handleClickShowDampPedal() {
        onChangeShowDampPedal((showDampPedal) => !showDampPedal)
    }

    return (
        <SideBar open={isOpen} onClose={onClose}>
            <div className={`${BASE_CLASS} pd-lg`} role="toolbar" aria-orientation="vertical">
                <h2 className={'pd-b-lg'}>Settings</h2>
                <h3 className={'pd-b-md'}>User Instrument</h3>
                <div className={`${BASE_CLASS}__user-instrument pd-b-md`}>
                    <InstrumentImage instrumentName={userInstrument} size={48} />
                    <InstrumentSelector onChange={onChangeInstrument} value={userInstrument} />
                </div>
                <Switch isOn={showNotes} onClick={handleClickShowNotes} className={'pd-md'}>
                    Show notes
                </Switch>
                <Switch isOn={showDampPedal} onClick={handleClickShowDampPedal} className={'pd-md'}>
                    Show damp pedal sections
                </Switch>
                {midiMetas ? (
                    <>
                        <h3>File infos</h3>
                        <p className={'pd-md'}>Format : {midiMetas.format}</p>
                        <h3>Music System</h3>
                        <MusicSystemSelector
                            onChange={onChangeMusicSystem}
                            musicSystem={musicSystem}
                        />
                        <h3>Tracks</h3>
                        <MidiTrackList
                            loadedInstrumentPlayers={loadedInstrumentPlayers}
                            activeInstruments={activeInstruments}
                            tracks={midiMetas.tracksMetas}
                            activeTracks={activeTracks}
                            allInstruments={midiMetas.instruments}
                            onChangeActiveTracks={onChangeActiveTracks}
                        />
                    </>
                ) : null}
            </div>
        </SideBar>
    )
}
