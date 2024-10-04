import { AwilixContainer } from "awilix";

export interface IFixture {
    load(container: AwilixContainer): Promise<void>
}