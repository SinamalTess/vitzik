import React from 'react'

export interface PresentationalComponentBasicProps<T> extends React.HTMLAttributes<T> {
    'data-testid'?: string
}
