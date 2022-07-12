import React, { ReactNode, useState } from 'react'
import { usePopper } from 'react-popper'
import './Tooltip.scss'
import { beforeWrite } from '@popperjs/core'
import clsx from 'clsx'
import { useClickOutside } from '../../../_hooks/useClickOutside'

interface TooltipProps {
    children: ReactNode
    arrow?: boolean
    referenceWidth?: boolean
    show?: boolean
    showOnHover?: boolean
    onShow?: () => void
    onHide?: () => void
}

export function Tooltip({
    children,
    arrow = true,
    referenceWidth = false,
    show = false,
    showOnHover = false,
    onShow = () => {},
    onHide = () => {},
}: TooltipProps) {
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
    const [popperElement, setPopperElement] = useState<HTMLSpanElement | null>(null)
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
    const [isOpen, setOpen] = useState(false)
    const isVisible = isOpen || show

    let modifiers = [
        { name: 'offset', options: { offset: [0, 8] } },
        { name: 'arrow', options: { element: arrowElement } },
    ]

    if (referenceWidth) {
        // @ts-ignore
        modifiers.push(referenceWidthModifier)
    }

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        modifiers,
        placement: 'bottom',
    })

    function onClickOutside() {
        onHide()
    }

    useClickOutside([referenceElement], onClickOutside, show)

    if (!children || !Array.isArray(children)) return null

    const referenceChild = children[0]
    const tooltipChild = children[1]

    const hoverProps = showOnHover
        ? {
              onMouseEnter: () => {
                  setOpen(true)
                  onShow()
              },
              onMouseLeave: () => {
                  setOpen(false)
                  onHide()
              },
          }
        : {}

    const classNames = clsx('tooltip', { 'tooltip--active': isVisible })

    return (
        <>
            {typeof referenceChild.type === 'function' ? ( // Function components can't have a ref
                <span ref={setReferenceElement} {...hoverProps}>
                    {referenceChild}
                </span>
            ) : (
                // If possible we avoid wrapping the component to save some additional DOM elements
                React.cloneElement(referenceChild, { ref: setReferenceElement, ...hoverProps })
            )}

            <span
                className={classNames}
                role="tooltip"
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
            >
                {tooltipChild}
                {arrow ? (
                    <div ref={setArrowElement} style={styles.arrow} className={'tooltip__arrow'} />
                ) : null}
            </span>
        </>
    )
}
