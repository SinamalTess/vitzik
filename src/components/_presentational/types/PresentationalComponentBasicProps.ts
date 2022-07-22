import React from 'react'

export interface PresentationalComponentBasicProps {
    className?: string[] | string
    style?: React.CSSProperties
    'aria-label'?: string
    'data-testid'?: string
}
