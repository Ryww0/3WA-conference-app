import { User } from "../../user/entities/user.entity";
import { UserFixture } from "../fixtures/user-fixture";


export const e2eUsers = {
    johnDoe: new UserFixture(
        new User({
            id: 'john-doe',
            emailAddress: 'johndoe@gmail.com',
            password: 'qwerty'
        })
    ),
    bob: new UserFixture(
        new User({
            id: 'bob',
            emailAddress: 'bob@gmail.com',
            password: 'qwerty'
        })
    ),
    alice: new UserFixture(
        new User({
            id: 'alice',
            emailAddress: 'alice@gmail.com',
            password: 'qwerty'
        })
    )
}