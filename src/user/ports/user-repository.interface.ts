import { User } from "../entities/user.entity";

export interface IUserRepository {
    create(user: User): Promise<void>
    findByEmailAddress(emailAddress: string): Promise<User | null>
    findById(id: string): Promise<User | null>
}