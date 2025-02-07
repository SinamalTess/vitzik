import { JSONTypes, WebPubSubClient } from '@azure/web-pubsub-client'
import { ENDPOINTS, getEndpoint } from '@/const/endpoints'

export class WebSocketMessenger {
    webSocket: null | WebPubSubClient = null

    async send(groupName: string, message: JSONTypes) {
        if (!this.webSocket) {
            await this.start()
        }

        try {
            // @ts-ignore
            await this.webSocket.sendToGroup('test', message, 'text')
        } catch (error) {
            console.error('Failed to send message:', error)
        }
    }

    async connect() {
        try {
            const endpoint = getEndpoint(ENDPOINTS.NEGOTIATE)
            const url = await fetch(endpoint)
                .then((response) => response.json())
                .then((data) => data.url)
            return url
        } catch (error) {
            console.error('Failed to connect:', error)
            throw error
        }
    }

    async joinGroup(groupName: string) {
        if (!this.webSocket) {
            await this.start()
        }

        try {
            // @ts-ignore
            await this.webSocket.joinGroup('test')
        } catch (error) {
            console.error('Failed to join group:', error)
        }
    }

    async start() {
        try {
            const url = await this.connect()
            const webSocket = new WebPubSubClient(url)
            webSocket.on('group-message', (e) => {
                console.log(`Received message: ${e.message.data}`)
            })

            await webSocket.start()

            this.webSocket = webSocket
        } catch (error) {
            console.error('Failed to start WebSocket:', error)
        }
    }
}
