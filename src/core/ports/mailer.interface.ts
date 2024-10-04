

export type Email = {
    from: string
    to: string
    subject: string
    body: string
}

export interface IMailer {
    send(email: Email): Promise<void>
}