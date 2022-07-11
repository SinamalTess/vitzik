import { RangeSlider } from '../generics/RangeSlider'
import { SoundButton } from '../SoundButton'
import { PlayButton } from '../PlayButton'
import React, { useEffect, useState } from 'react'
import { msPerBeatToBeatPerMin, msToMinAndSec, normalizeTitle } from '../../utils'
import { usePrevious } from '../../hooks'
// @ts-ignore
import workerInterval from '../../workers/interval.js'
import { AudioPlayerState, MidiMetas } from '../../types'
import './AudioPlayer.scss'
import { MidiVisualizerCoordinates } from '../Visualizer/MidiVisualizerCoordinates'
import { Button } from '../generics/Button'
import { Divider } from '../generics/Divider'
import { Tooltip } from '../generics/Tooltip'
import { ButtonGroup } from '../generics/ButtonGroup'
import { WebWorker } from '../../workers/WebWorker'

interface AudioPlayerProps {
    midiTitle?: string
    midiMetas: MidiMetas
    midiSpeedFactor: number
    isMute: boolean
    workersChannel: MessageChannel
    isPlaying: boolean
    onToggleSound: (isSoundOn: boolean) => void
    onChangeAudioPlayerState: (audioPlayerState: AudioPlayerState) => void
    onChangeWorkersChannel: React.Dispatch<React.SetStateAction<MessageChannel>>
    onChangeMidiSpeedFactor: React.Dispatch<React.SetStateAction<number>>
    onPlay: React.Dispatch<React.SetStateAction<boolean>>
}

export function AudioPlayer({
    isMute,
    isPlaying,
    midiTitle,
    midiMetas,
    midiSpeedFactor,
    onToggleSound,
    onChangeAudioPlayerState,
    onChangeWorkersChannel,
    onChangeMidiSpeedFactor,
    onPlay,
}: AudioPlayerProps) {
    const [midiCurrentTime, setMidiCurrentTime] = useState(0)
    const [isSearching, setIsSearching] = useState(false)
    const [isBPMTooltipOpen, setIsBPMTooltipOpen] = useState<boolean>(false)

    const { midiDuration, allMsPerBeat } = midiMetas
    const currentTime = msToMinAndSec(midiCurrentTime)
    const totalTime = msToMinAndSec(midiDuration)
    const prevMidiCurrentTime = usePrevious(midiCurrentTime) ?? 0
    const title = normalizeTitle(midiTitle ?? '')
    const msPerBeat = MidiVisualizerCoordinates.getMsPerBeatFromTime(
        allMsPerBeat,
        midiCurrentTime
    ).value

    useEffect(() => {
        let worker: Worker = WebWorker(workerInterval)
        const messageChannel = new MessageChannel()
        const sendingPort = messageChannel.port2
        const receivingPort = messageChannel.port1

        function stopWorker() {
            sendStopMessage()
            worker.terminate()
        }

        function sendStopMessage() {
            worker.postMessage({ code: 'stop' })
        }

        function portListener(message: MessageEvent) {
            const { code } = message.data
            if (code === 'interval') {
                const { midiCurrentTime: newMidiCurrentTime } = message.data
                setMidiCurrentTime((midiCurrentTime: number) => {
                    if (midiCurrentTime > midiDuration) {
                        worker.terminate()
                        onPlay(false)
                        return 0
                    }
                    return newMidiCurrentTime
                })
            }
        }

        function startWorker() {
            worker.postMessage(
                {
                    code: 'start',
                    port: sendingPort,
                    midiCurrentTime,
                    midiSpeedFactor,
                },
                [sendingPort]
            )
            onChangeWorkersChannel(messageChannel)
        }

        if (isPlaying && !isSearching) {
            receivingPort.start()
            receivingPort.addEventListener('message', portListener)
            startWorker()
        } else {
            stopWorker()
            receivingPort.removeEventListener('message', portListener)
        }

        return function cleanup() {
            stopWorker()
            receivingPort.removeEventListener('message', portListener)
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
        setMidiCurrentTime(parseInt(value))
    }

    function handleClickOnPlay() {
        onPlay((isPlaying) => !isPlaying)
    }

    function handleClickOnStop() {
        onPlay(false)
        setMidiCurrentTime(0)
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
