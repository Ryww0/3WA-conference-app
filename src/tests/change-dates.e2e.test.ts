import { addDays, addHours } from "date-fns";
import { Application } from "express";
import request from "supertest";
import { IConferenceRepository } from "../conference/ports/conference-repository.interface";
import container from "../infrastructure/express_api/config/dependency-injection";
import { e2eBooking } from "./seeds/booking-seeds";
import { e2eConference } from "./seeds/conference-seeds";
import { e2eUsers } from "./seeds/user-seeds";
import { TestApp } from "./utils/test-app";

describe("Feature: Change Dates", () => {
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

  describe("Scenario: Happy path", () => {
    it("should change the dates", async () => {
      const startDate = addDays(new Date(), 8);
      const endDate = addDays(addHours(new Date(), 2), 8);
      const id = e2eConference.conference1.entity.props.id;

      const result = await request(app)
        .patch(`/conference/dates/${id}`)
        .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken())
        .send({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(result.status).toBe(200);

      const conferenceRepository = container.resolve(
        "conferenceRepository"
      ) as IConferenceRepository;
      const fetchedConference = await conferenceRepository.findById(id);

      expect(fetchedConference).toBeDefined();
      expect(fetchedConference!.props.startDate).toEqual(startDate);
      expect(fetchedConference!.props.endDate).toEqual(endDate);
    });
  });

  describe("Scenario: User is not authorized", () => {
    it("should return 403 Unauthorized", async () => {
      const startDate = addDays(new Date(), 8);
      const endDate = addDays(addHours(new Date(), 2), 8);
      const id = e2eConference.conference1.entity.props.id;

      const result = await request(app)
        .patch(`/conference/dates/${id}`)
        .send({ startDate, endDate });

      expect(result.status).toBe(403);
    });
  });
});
