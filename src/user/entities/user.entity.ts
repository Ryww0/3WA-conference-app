import { Entity } from "../../core/entities/entity"

type UserProps = {
    id: string,
    emailAddress: string,
    password: string
}

export class User extends Entity<UserProps> {
    
}