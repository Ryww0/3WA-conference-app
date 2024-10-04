import { User } from "../../user/entities/user.entity";
import { testUsers } from "../../user/tests/user-seeds";
import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository";
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository";
import { Booking } from "../entities/booking.entity";
import { testConference } from "../tests/conference-seeds";
import { ChangeSeats } from "./change-seats";

describe("Feature: Changing the number of seats", () => {
  async function expectSeatsUnchanged() {
    const fetchedConference = await repository.findById(
      testConference.conference1.props.id
    );
    expect(fetchedConference?.props.seats).toEqual(50);
  }

  let repository: InMemoryConferenceRepository;
  let bookingRepository: InMemoryBookingRepository;
  let useCase: ChangeSeats;

  beforeEach(async () => {
    repository = new InMemoryConferenceRepository();
    bookingRepository = new InMemoryBookingRepository();
    await repository.create(testConference.conference1);
    useCase = new ChangeSeats(repository, bookingRepository);
  });

  describe("Scenario: Happy path", () => {
    it("should change the number of seats", async () => {
      await useCase.execute({
        user: testUsers.johnDoe,
        conferenceId: testConference.conference1.props.id,
        seats: 100,
      });

      const fetchedConference = await repository.findById(
        testConference.conference1.props.id
      );
      expect(fetchedConference!.props.seats).toEqual(100);
    });
  });

  describe("Scenario: Conference does not exit", () => {
    it("should fail", async () => {
      await expect(
        useCase.execute({
          user: testUsers.johnDoe,
          conferenceId: "non-existing-id",
          seats: 100,
        })
      ).rejects.toThrow("Conference not found");

      await expectSeatsUnchanged();
    });
  });

  describe("Scenario: Update the conference of someone else", () => {
    it("should fail", async () => {
      await expect(
        useCase.execute({
          user: testUsers.bob,
          conferenceId: testConference.conference1.props.id,
          seats: 100,
        })
      ).rejects.toThrow("You are not allowed to update this conference");

      await expectSeatsUnchanged();
    });
  });

  describe("Scenario: Number of seats <= 1000", () => {
    it("should fail", async () => {
      await expect(
        useCase.execute({
          user: testUsers.johnDoe,
          conferenceId: testConference.conference1.props.id,
          seats: 1001,
        })
      ).rejects.toThrow(
        "The conference must have a maximum of 1000 seats and minimum of 20 seats"
      );

      await expectSeatsUnchanged();
    });
  });

  describe("Scenario: Number of seats >= 20", () => {
    it("should fail", async () => {
      await expect(
        useCase.execute({
          user: testUsers.johnDoe,
          conferenceId: testConference.conference1.props.id,
          seats: 15,
        })
      ).rejects.toThrow(
        "The conference must have a maximum of 1000 seats and minimum of 20 seats"
      );

      await expectSeatsUnchanged();
    });
  });

  describe("Scenario: change number of seats less than already taken", () => {
    it("should fail", async () => {
      for (let i = 0; i < 21; i++) {
        const user = new User({
          id: `id-${i}`,
          emailAddress: `user${i}@gmail.com`,
          password: "azerty",
        });

        await bookingRepository.create(
          new Booking({
            userId: user.props.id,
            conferenceId: testConference.conference1.props.id,
          })
        );
      }

      await expect(
        useCase.execute({
          user: testUsers.johnDoe,
          conferenceId: testConference.conference1.props.id,
          seats: 20,
        })
      ).rejects.toThrow(
        "The conference has more booking than seats you try to set."
      );

      await expectSeatsUnchanged();
    });
  });
});
