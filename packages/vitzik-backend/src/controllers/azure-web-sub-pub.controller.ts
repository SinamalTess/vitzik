import { AzureKeyCredential, WebPubSubServiceClient } from '@azure/web-pubsub'
import { Request, Response } from 'express'

export const AzureWebSubPubController = (req: Request, res: Response) => {
    const KEY = process.env.KEY
    const CREDENTIALS = new AzureKeyCredential(KEY)
    const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT

    const HUB = 'vitzik'

    const serviceClient = new WebPubSubServiceClient(
        AZURE_ENDPOINT,
        CREDENTIALS,
        HUB
    )

    const joinGroup = async (groupName: string) => {
        try {
            const hasConnections = await serviceClient.groupExists(groupName)
            if (hasConnections) {
                res.status(400).send('Group already exists')
            } else {
                serviceClient.group(groupName)
                res.status(200).send('Group created')
            }
        } catch (error) {
            console.error('Failed to join group:', error)
            res.status(500).send('Internal Server Error')
        }
    }

    const negotiate = async () => {
        try {
            const token = await serviceClient.getClientAccessToken({
                roles: ['webpubsub.joinLeaveGroup', 'webpubsub.sendToGroup'],
            })

            res.json({
                url: token.url,
            })
        } catch (error) {
            console.error('Failed to negotiate:', error)
            res.status(500).send('Internal Server Error')
        }
    }

    return { joinGroup, negotiate }
}
