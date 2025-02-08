import { JSONTypes, WebPubSubClient } from '@azure/web-pubsub-client'
import { ENDPOINTS, getEndpoint } from '@/const/endpoints'

export class WebSocketMessenger {
    webSocket: null | WebPubSubClient = null

    async send(groupName: string, message: JSONTypes) {
        if (!this.webSocket) {
            await this.start()
        }

        // @ts-ignore
        await this.webSocket.sendToGroup('test', message, 'text')
    }

    async connect() {
        const endpoint = getEndpoint(ENDPOINTS.NEGOTIATE)
        const url = await fetch(endpoint)
            .then((response) => response.json())
            .then((data) => data.url)

        return url
    }

    async joinGroup(groupName: string) {
        if (!this.webSocket) {
            await this.start()
        }

        // @ts-ignore
        await this.webSocket.joinGroup('test')
    }

    async start() {
        const url = await this.connect()
        const webSocket = new WebPubSubClient(url)
        webSocket.on('group-message', (e) => {
            console.log(`Received message: ${e.message.data}`)
        })

        await webSocket.start()

        this.webSocket = webSocket
    }
}
