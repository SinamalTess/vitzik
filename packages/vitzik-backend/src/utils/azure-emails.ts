import { EmailClient } from '@azure/communication-email'

const connectionString = process.env.AZURE_EMAIL_SERVICE_ENDPOINT
const client = new EmailClient(connectionString)

interface EmailOptions {
    subject: string
    html: string
    recipients: { address: string }[]
}

export const sendAzureEmail = async (emailOptions: EmailOptions) => {
    const { subject, html, recipients } = emailOptions

    const emailMessage = {
        //TODO: replace by final sender address
        senderAddress: 'vitzik@mydomain.com',
        content: {
            subject,
            plainText: 'Hello world via email.',
            html,
        },
        recipients: {
            to: recipients,
        },
    }

    const poller = await client.beginSend(emailMessage)
    const result = await poller.pollUntilDone()
}

interface LoginEmailOptions {
    to: string
    magicLink: string
}

export const sendAzureLoginEmail = async (emailOptions: LoginEmailOptions) => {
    const recipient = { address: emailOptions.to }
    const subject = 'Your login link'
    const html = `
			<html lang="en">
				<body>
					<p>This is your login <a href="${emailOptions.magicLink}">link</a></p>
				</body>
			</html>`
    const recipients = [recipient]

    await sendAzureEmail({ subject, html, recipients })
}
