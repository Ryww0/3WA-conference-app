import { addDays, addHours } from "date-fns";
import { testUsers } from "../../user/tests/user-seeds";
import { Conference } from "../entities/conference.entity";

export const testConference = {
  conference1: new Conference({
    id: "id-1",
    organizerId: testUsers.johnDoe.props.id,
    title: "My first conference",
    seats: 50,
    startDate: addDays(new Date(), 4),
    endDate: addDays(addHours(new Date(), 2), 4),
  }),
  conference2: new Conference({
    id: "id-2",
    organizerId: testUsers.johnDoe.props.id,
    title: "My second conference",
    seats: 50,
    startDate: addDays(new Date(), 4),
    endDate: addDays(addHours(new Date(), 2), 4),
  }),
};
