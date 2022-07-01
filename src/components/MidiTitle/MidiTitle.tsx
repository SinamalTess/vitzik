import React, { useEffect, useState } from 'react'
import './MidiTitle.scss'
import { CSSTransition } from 'react-transition-group'
import { normalizeTitle } from '../../utils'

interface MidiTrackInfosPros {
    midiTitle: string
}

export function MidiTitle({ midiTitle }: MidiTrackInfosPros) {
    const [isVisible, setIsVisible] = useState<boolean>(false)
    const title = normalizeTitle(midiTitle)
    const animationDuration = 500

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
            timeout={animationDuration}
            classNames="midi-title"
        >
            <div className="midi-title midi-title--active">
                <p className="midi-title__text" data-text={title}>
                    {title}
                </p>
            </div>
        </CSSTransition>
    )
}
