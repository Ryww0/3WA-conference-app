import { User } from "../entities/user.entity";


export const testUsers = {
    johnDoe: new User({
        id: 'john-doe',
        emailAddress: 'johndoe@gmail.com',
        password: 'qwerty'
    }),
    bob: new User({
        id: 'bob',
        emailAddress: 'bob@gmail.com',
        password: 'qwerty'
    }),
    alice: new User({
        id: 'alice',
        emailAddress: 'alice@gmail.com',
        password: 'qwerty'
    })
}