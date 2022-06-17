import { RangeSlider } from './generics/RangeSlider'
import { SoundController } from './SoundController'
import { PlayButton } from './PlayButton'
import React, { useEffect, useState } from 'react'
import { msToMinAndSec } from '../utils'
import { usePrevious } from '../hooks'
import workerInterval from '../workers/workerInterval'
import { AudioPlayerState } from '../types'

interface AudioPlayerProps {
    midiTrackCurrentTime: number
    midiTrackDuration: number
    isMute: boolean
    onToggleSound: (isSoundOn: boolean) => void
    onChangeAudioPlayerState: (audioPlayerState: AudioPlayerState) => void
    onChangeMidiTrackCurrentTime: React.Dispatch<React.SetStateAction<number>>
}

function WebWorker(worker: any): Worker {
    const code = worker.toString()
    const blob = new Blob(['(' + code + ')()'])
    return new Worker(URL.createObjectURL(blob))
}

export function AudioPlayer({
    midiTrackCurrentTime,
    midiTrackDuration,
    isMute,
    onToggleSound,
    onChangeAudioPlayerState,
    onChangeMidiTrackCurrentTime,
}: AudioPlayerProps) {
    const currentTime = msToMinAndSec(midiTrackCurrentTime)
    const totalTime = msToMinAndSec(midiTrackDuration)
    const prevMidiTrackCurrentTime = usePrevious(midiTrackCurrentTime) ?? 0

    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [isSearching, setIsSearching] = useState<boolean>(false)

    useEffect(() => {
        let worker: Worker = WebWorker(workerInterval)

        function startWorker() {
            worker.postMessage('start')
            worker.onmessage = (message) => {
                if (message.data.hasOwnProperty('interval')) {
                    const interval = message.data.interval
                    onChangeMidiTrackCurrentTime((midiTrackCurrentTime: number) => {
                        if (midiTrackCurrentTime > midiTrackDuration) {
                            worker.terminate()
                            setIsPlaying(false)
                            return 0
                        }
                        return midiTrackCurrentTime + interval
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
    }, [isPlaying, isSearching])

    useEffect(() => {
        if (isPlaying && !isSearching) {
            onChangeAudioPlayerState('playing')
        } else {
            if (midiTrackCurrentTime === 0) {
                onChangeAudioPlayerState('stopped')
            } else if (midiTrackCurrentTime > prevMidiTrackCurrentTime) {
                onChangeAudioPlayerState('seeking')
            } else if (midiTrackCurrentTime < prevMidiTrackCurrentTime) {
                onChangeAudioPlayerState('rewinding')
            } else {
                onChangeAudioPlayerState('paused')
            }
        }
    }, [midiTrackCurrentTime, isPlaying, isSearching])

    function handleChange(midiTrackCurrentTime: number) {
        onChangeMidiTrackCurrentTime(midiTrackCurrentTime)
    }

    function handleClick() {
        setIsPlaying((isPlaying) => !isPlaying)
    }

    function handleMouseDown() {
        setIsSearching(true)
    }

    function handleMouseUp() {
        setIsSearching(false)
    }

    return (
        <div className="audioplayer">
            {currentTime}
            <RangeSlider
                value={midiTrackCurrentTime}
                max={midiTrackDuration}
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
