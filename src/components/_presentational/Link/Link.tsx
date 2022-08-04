import React from 'react'
import { PresentationalComponentBasicProps } from '../types'

interface LinkProps extends PresentationalComponentBasicProps {
    children: string
    href: string
}

export function Link({ href, children, style }: LinkProps) {
    return (
        <a href={href} style={style} target="_blank" rel="noreferrer">
            {children}
        </a>
    )
}
