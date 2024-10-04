import { addDays, addHours } from "date-fns";
import { Conference } from "../../conference/entities/conference.entity";
import { ConferenceFixture } from "../fixtures/conference-fixture";
import { e2eUsers } from "./user-seeds";


export const e2eConference = {
    conference1: new ConferenceFixture(
        new Conference({
            id: 'id-1',
            organizerId: e2eUsers.johnDoe.entity.props.id,
            title: "My first conference",
            seats: 50,
            startDate: addDays(new Date(), 4),
            endDate: addDays(addHours(new Date(), 2), 4)
        })
    )
}