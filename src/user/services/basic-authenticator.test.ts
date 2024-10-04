import { InMemoryUserRepository } from "../adapters/in-memory-user-repository"
import { User } from "../entities/user.entity"
import { BasicAuthenticator } from "./basic-authenticator"

describe('Authentication', () => {
    let repository: InMemoryUserRepository
    let authenticator: BasicAuthenticator

    beforeEach(async () => {
        repository = new InMemoryUserRepository()
        await repository.create(
            new User({
                id: 'john-doe',
                emailAddress: 'johndoe@gmail.com',
                password: 'qwerty'
            })
        )

        authenticator = new BasicAuthenticator(repository)
        })

    describe('Scenario: token is valid', () => {
        it('should return a user', async () => {
            const payload = Buffer.from('johndoe@gmail.com:qwerty').toString('base64')
            const user = await authenticator.authenticate(payload)
    
            expect(user.props).toEqual({
                id: 'john-doe',
                emailAddress: 'johndoe@gmail.com',
                password: 'qwerty'
            })
        })
    })

    describe('Scenario: email is not valid', () => {
        it('should throw an error', async () => {
            const payload = Buffer.from('unknown@gmail.com:qwerty').toString('base64')
            await expect(authenticator.authenticate(payload)).rejects.toThrow("Wrong credentials")
        })
    })

    describe('Scenario: password is not valid', () => {
        it('should throw an error', async () => {
            const payload = Buffer.from('johndoe@gmail.com:wrong-password').toString('base64')
            await expect(authenticator.authenticate(payload)).rejects.toThrow("Wrong credentials")
        })
    })
})