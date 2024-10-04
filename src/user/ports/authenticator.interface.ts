import { User } from "../entities/user.entity";


export interface IAuthenticator {
    authenticate(token: string) : Promise<User>
}