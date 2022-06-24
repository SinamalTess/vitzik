import React, { ReactNode, useState } from 'react'
import { usePopper } from 'react-popper'
import './Tooltip.scss'
import { beforeWrite } from '@popperjs/core'
import clsx from 'clsx'

interface TooltipProps {
    children: ReactNode
    arrow?: boolean
    referenceWidth?: boolean
    show: boolean
}

export function Tooltip({ children, arrow = true, referenceWidth = false, show }: TooltipProps) {
    /*
        We have to use useMemo to define a custom modifier 
        See this : https://popper.js.org/react-popper/v2/faq/
    */
    const referenceWidthModifier = React.useMemo(
        () => ({
            name: 'sameWidth',
            enabled: true,
            fn: ({ state }: any) => {
                state.styles.popper.width = `${state.rects.reference.width}px`
            },
            phase: beforeWrite,
            requires: ['computeStyles'],
        }),
        []
    )
    const [referenceElement, setReferenceElement] = useState<HTMLSpanElement | null>(null)
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        modifiers: [
            { name: 'arrow', options: { element: arrowElement } },
            referenceWidth ? referenceWidthModifier : {},
        ],
        placement: referenceWidth ? 'bottom-start' : undefined,
    })

    if (!children || !Array.isArray(children)) return null

    const className = clsx('tooltip', { 'tooltip--active': show })

    return (
        <>
            <span ref={setReferenceElement}>{children[0]}</span>

            <div
                className={className}
                role="tooltip"
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
            >
                {children.map((child, index) => (index === 0 ? null : child))}
                {arrow ? (
                    <div ref={setArrowElement} style={styles.arrow} className={'tooltip__arrow'} />
                ) : null}
            </div>
        </>
    )
}
