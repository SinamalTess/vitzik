import React, { useEffect, useState } from 'react'
import './MidiTitle.scss'
import { CSSTransition } from 'react-transition-group'
import { normalizeTitle } from '../../utils'

interface MidiTrackInfosPros {
    midiTitle: string
}

const ANIMATION_DURATION = 500

export function MidiTitle({ midiTitle }: MidiTrackInfosPros) {
    const [isVisible, setIsVisible] = useState<boolean>(false)
    const title = normalizeTitle(midiTitle)

    useEffect(() => {
        setIsVisible(true)
        const stopAnimation = setTimeout(() => setIsVisible(false), 1000)

        return function cleanup() {
            clearTimeout(stopAnimation)
        }
    }, [midiTitle])

    return (
        <CSSTransition
            unmountOnExit
            appear={isVisible}
            in={isVisible}
            timeout={ANIMATION_DURATION}
            classNames="midi-title"
        >
            <div className="midi-title">
                <p className="midi-title__text" data-text={title}>
                    {title}
                </p>
            </div>
        </CSSTransition>
    )
}
