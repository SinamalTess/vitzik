import { RangeSlider } from '../generics/RangeSlider'
import { SoundController } from '../SoundController'
import { PlayButton } from '../PlayButton'
import React, { useEffect, useState } from 'react'
import { msToMinAndSec } from '../../utils'
import { usePrevious } from '../../hooks'
import workerInterval from '../../workers/workerInterval'
import { AudioPlayerState } from '../../types'
import './AudioPlayer.scss'

interface AudioPlayerProps {
    midiCurrentTime: number
    midiDuration: number
    isMute: boolean
    isPlaying: boolean
    onToggleSound: (isSoundOn: boolean) => void
    onChangeAudioPlayerState: (audioPlayerState: AudioPlayerState) => void
    onChangeMidiCurrentTime: React.Dispatch<React.SetStateAction<number>>
    onPlay: React.Dispatch<React.SetStateAction<boolean>>
}

function WebWorker(worker: any): Worker {
    const code = worker.toString()
    const blob = new Blob(['(' + code + ')()'])
    return new Worker(URL.createObjectURL(blob))
}

export function AudioPlayer({
    midiCurrentTime,
    midiDuration,
    isMute,
    isPlaying,
    onToggleSound,
    onChangeAudioPlayerState,
    onChangeMidiCurrentTime,
    onPlay,
}: AudioPlayerProps) {
    const currentTime = msToMinAndSec(midiCurrentTime)
    const totalTime = msToMinAndSec(midiDuration)
    const prevMidiCurrentTime = usePrevious(midiCurrentTime) ?? 0

    const [isSearching, setIsSearching] = useState<boolean>(false)

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
                        return midiCurrentTime + interval
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
    }, [isPlaying, isSearching, midiDuration])

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

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target
        onChangeMidiCurrentTime(parseInt(value))
    }

    function handleClick() {
        onPlay((isPlaying) => !isPlaying)
    }

    function handleMouseDown() {
        setIsSearching(true)
    }

    function handleMouseUp() {
        setIsSearching(false)
    }

    return (
        <div className="audio-player">
            {currentTime}
            <RangeSlider
                value={midiCurrentTime}
                max={midiDuration}
                onChange={handleChange}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            />
            {totalTime}
            <SoundController isMute={isMute} onToggleSound={onToggleSound} />
            <PlayButton onClick={handleClick} isPlaying={isPlaying} />
        </div>
    )
}
