import { InMemoryMailer } from "../../core/adapters/in-memory-mailer";
import { User } from "../../user/entities/user.entity";
import { testUsers } from "../../user/tests/user-seeds";
import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository";
import { Booking } from "../entities/booking.entity";
import { Conference } from "../entities/conference.entity";
import { ReserveSeats } from "./reserve-seats";

describe("Feature: Reserve seats", () => {
  const conference = new Conference({
    id: "id-1",
    organizerId: testUsers.johnDoe.props.id,
    title: "Title",
    seats: 20,
    startDate: new Date("2024-09-01T10:00:00.000Z"),
    endDate: new Date("2024-09-01T11:00:00.000Z"),
  });

  let repository: InMemoryBookingRepository;
  let mailer: InMemoryMailer;
  let useCase: ReserveSeats;

  beforeEach(() => {
    repository = new InMemoryBookingRepository();
    useCase = new ReserveSeats(repository, mailer);
  });

  describe("Scenario: Happy path", () => {
    const payload = {
      user: testUsers.alice,
      conference: conference,
    };

    it("should insert booking into the database", async () => {
      await useCase.execute(payload);

      const createdBooking = repository.database[0];

      expect(repository.database.length).toBe(1);
      expect(createdBooking.props).toEqual({
        userId: testUsers.alice.props.id,
        conferenceId: "id-1",
      });
    });

    it("should send an email to the user", async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails).toEqual([
        {
          from: "TEDx conference",
          to: testUsers.alice.props.emailAddress,
          subject: "Booking conference confirmation",
          body: `We confirm you that the booking of the conference ${conference.props.title} has been accepted.`,
        },
      ]);
    });

    it("should send an email to the organizer", async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails).toEqual([
        {
          from: "TEDx conference",
          to: testUsers.johnDoe.props.emailAddress,
          subject: "Booking conference confirmation",
          body: `A new user just booked the conference ${conference.props.title}`,
        },
      ]);
    });
  });

  describe("Scenario: the conference has no seats left", () => {
    const payload = {
      user: testUsers.alice,
      conference: conference,
    };

    it("should throw an error", async () => {
      for (let i = 0; i < 20; i++) {
        const user = new User({
          id: `id-${i}`,
          emailAddress: `user${i}@gmail.com`,
          password: "qwerty",
        });
        const payload = {
          user: user,
          conference: conference,
        };
        await useCase.execute(payload);
      }

      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "The conference has no more seats left."
      );
    });

    it("should not create a booking", async () => {
      for (let i = 0; i < 20; i++) {
        const user = new User({
          id: `id-${i}`,
          emailAddress: `user${i}@gmail.com`,
          password: "qwerty",
        });
        const payload = {
          user: user,
          conference: conference,
        };
        await useCase.execute(payload);
      }
      try {
        await expect(() => useCase.execute(payload)).rejects.toThrow();
      } catch (error) {}

      expect(repository.database.length).toBe(20); // max booking is 20 so i created 20 bookings above with for
    });
  });

  describe("Scenario: User already booked the conference", () => {
    const payload = {
      user: testUsers.alice,
      conference: conference,
    };

    it("should throw an error", async () => {
      await useCase.execute(payload);
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        "User already booked this conference."
      );
    });

    it("should not create a booking", async () => {
      try {
        await expect(() => useCase.execute(payload)).rejects.toThrow();
      } catch (error) {}

      expect(repository.database.length).toBe(1); // 1 because I created one above to throw the error. If the error occurs it's because the user already booked the conference
    });
  });
});
