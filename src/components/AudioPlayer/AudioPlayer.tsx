import { RangeSlider } from '../generics/RangeSlider'
import { SoundButton } from '../SoundButton'
import { PlayButton } from '../PlayButton'
import React, { useEffect, useState } from 'react'
import { msPerBeatToBeatPerMin, msToMinAndSec, normalizeTitle } from '../../utils'
import { usePrevious } from '../../hooks'
import workerInterval from '../../workers/workerInterval'
import { AudioPlayerState, MidiMetas } from '../../types'
import './AudioPlayer.scss'
import { MidiVisualizerCoordinates } from '../Visualizer/MidiVisualizerCoordinates'
import { Button } from '../generics/Button'
import { Divider } from '../generics/Divider'
import { Tooltip } from '../generics/Tooltip'
import { ButtonGroup } from '../generics/ButtonGroup'

interface AudioPlayerProps {
    midiCurrentTime: number
    midiTitle?: string
    midiMetas: MidiMetas
    midiSpeedFactor: number
    isMute: boolean
    isPlaying: boolean
    onToggleSound: (isSoundOn: boolean) => void
    onChangeAudioPlayerState: (audioPlayerState: AudioPlayerState) => void
    onChangeMidiCurrentTime: React.Dispatch<React.SetStateAction<number>>
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
    onPlay: React.Dispatch<React.SetStateAction<boolean>>
}

function WebWorker(worker: any): Worker {
    const code = worker.toString()
    const blob = new Blob(['(' + code + ')()'])
    return new Worker(URL.createObjectURL(blob))
}

export function AudioPlayer({
    midiCurrentTime,
    isMute,
    isPlaying,
    midiTitle,
    midiMetas,
    midiSpeedFactor,
    onToggleSound,
    onChangeAudioPlayerState,
    onChangeMidiCurrentTime,
    onChangeMidiSpeedFactor,
    onPlay,
}: AudioPlayerProps) {
    const { midiDuration, allMsPerBeat } = midiMetas
    const currentTime = msToMinAndSec(midiCurrentTime)
    const totalTime = msToMinAndSec(midiDuration)
    const prevMidiCurrentTime = usePrevious(midiCurrentTime) ?? 0
    const title = normalizeTitle(midiTitle ?? '')
    const msPerBeat = MidiVisualizerCoordinates.getMsPerBeatFromTime(
        allMsPerBeat,
        midiCurrentTime
    ).value

    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [isBPMTooltipOpen, setIsBPMTooltipOpen] = useState<boolean>(false)

    useEffect(() => {
        let worker: Worker = WebWorker(workerInterval)

        function startWorker() {
            worker.postMessage('start')
            worker.onmessage = (message) => {
                if (message.data.hasOwnProperty('interval')) {
                    const interval = message.data.interval
                    onChangeMidiCurrentTime((midiCurrentTime: number) => {
                        if (midiCurrentTime > midiDuration) {
                            worker.terminate()
                            onPlay(false)
                            return 0
                        }
                        return midiCurrentTime + interval / midiSpeedFactor
                    })
                }
            }
        }

        if (isPlaying && !isSearching) {
            startWorker()
        } else {
            worker.terminate()
        }

        return function cleanup() {
            worker.terminate()
        }
    }, [isPlaying, isSearching, midiDuration, midiSpeedFactor])

    useEffect(() => {
        if (isPlaying && !isSearching) {
            onChangeAudioPlayerState('playing')
        } else {
            if (midiCurrentTime === 0) {
                onChangeAudioPlayerState('stopped')
            } else if (midiCurrentTime > prevMidiCurrentTime) {
                onChangeAudioPlayerState('seeking')
            } else if (midiCurrentTime < prevMidiCurrentTime) {
                onChangeAudioPlayerState('rewinding')
            } else {
                onChangeAudioPlayerState('paused')
            }
        }
    }, [midiCurrentTime, isPlaying, isSearching])

    function handleChangeAudioPlayer(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        onChangeMidiCurrentTime(parseInt(value))
    }

    function handleClickOnPlay() {
        onPlay((isPlaying) => !isPlaying)
    }

    function handleClickOnStop() {
        onPlay(false)
        onChangeMidiCurrentTime(0)
    }

    function handleMouseDown() {
        setIsSearching(true)
    }

    function handleMouseUp() {
        setIsSearching(false)
    }

    function handleChangeMidiSpeedFactor(value: number) {
        onChangeMidiSpeedFactor(value)
    }

    function handleClickBPM() {
        setIsBPMTooltipOpen((isBPMTooltipOpen) => !isBPMTooltipOpen)
    }

    const speedFactors = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    const actualBpm = Math.round(msPerBeatToBeatPerMin(msPerBeat) / midiSpeedFactor)

    return (
        <div className="audio-player">
            <Tooltip showOnHover>
                <span className="title">{title}</span>
                {title}
            </Tooltip>
            <span className="current-time">{currentTime}</span>
            <RangeSlider
                className="progress-bar"
                value={midiCurrentTime}
                max={midiDuration}
                onChange={handleChangeAudioPlayer}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            />
            <span className="total-time">{totalTime}</span>
            <Button onClick={handleClickOnStop} icon="stop" variant="link" color="secondary" />
            <PlayButton onClick={handleClickOnPlay} isPlaying={isPlaying} />
            <SoundButton isMute={isMute} onToggleSound={onToggleSound} />
            <Divider orientation="vertical" />
            <Tooltip show={isBPMTooltipOpen}>
                <Button onClick={handleClickBPM}> {actualBpm} </Button>
                <span className="bpm">
                    BPM :
                    <ButtonGroup size={'sm'}>
                        {speedFactors.map((factor, index) => (
                            <Button
                                active={factor === midiSpeedFactor}
                                onClick={() => {
                                    handleChangeMidiSpeedFactor(factor)
                                }}
                            >
                                x{speedFactors[index]}
                            </Button>
                        ))}
                    </ButtonGroup>
                </span>
            </Tooltip>
            <Divider orientation="vertical" />
        </div>
    )
}
