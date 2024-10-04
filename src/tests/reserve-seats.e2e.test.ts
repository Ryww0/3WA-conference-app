import { Application } from "express";
import request from "supertest";
import { TestApp } from "./utils/test-app";
import { e2eUsers } from "./seeds/user-seeds";
import { e2eBooking } from "./seeds/booking-seeds";
import { e2eConference } from "./seeds/conference-seeds";
import container from "../infrastructure/express_api/config/dependency-injection";
import { IBookingRepository } from "../conference/ports/booking-repository.interface";

describe("Feature: reserve seats", () => {
  let testApp: TestApp;
  let app: Application;

  beforeEach(async () => {
    testApp = new TestApp();
    await testApp.setup();
    await testApp.loadAllFixtures([
      e2eUsers.johnDoe,
      e2eUsers.bob,
      e2eUsers.alice,
      e2eBooking.aliceBooking,
      e2eBooking.bobBooking,
      e2eConference.conference1,
    ]);
    app = testApp.expressApp;
  });

  afterAll(async () => {
    await testApp.tearDown();
  });

  describe("Scenario: Happy Path", () => {
    it("should reserve the seats", async () => {
      const id = e2eConference.conference1.entity.props.id;

      const result = await request(app).post(`/conference/book/${id}`).send({
        user: e2eUsers.alice.entity,
        conference: e2eConference.conference1.entity,
      });

      expect(result.status).toBe(201);

      const bookingRepository = container.resolve(
        "bookingRepository"
      ) as IBookingRepository;

      const fecthedBooking =
        await bookingRepository.findByConferenceIdAndUserId(
          id,
          e2eUsers.alice.entity.props.id
        );

      expect(fecthedBooking).toBeDefined();
      expect(fecthedBooking?.props.conferenceId).toEqual(id);
      expect(fecthedBooking?.props.userId).toEqual(
        e2eUsers.alice.entity.props.id
      );
    });
  });
});
