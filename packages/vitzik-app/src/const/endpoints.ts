export const ENDPOINTS = {
    HOST: 'http://localhost:8080',
    NEGOTIATE: '/negotiate',
} as const

export const getEndpoint = (endpoint: (typeof ENDPOINTS)[keyof typeof ENDPOINTS]) =>
    `${ENDPOINTS.HOST}${endpoint}`
