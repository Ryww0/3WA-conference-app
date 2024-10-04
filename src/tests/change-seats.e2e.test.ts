import { Application } from "express";
import request from "supertest";
import { IConferenceRepository } from "../conference/ports/conference-repository.interface";
import container from "../infrastructure/express_api/config/dependency-injection";
import { e2eConference } from "./seeds/conference-seeds";
import { e2eUsers } from "./seeds/user-seeds";
import { TestApp } from "./utils/test-app";

describe("Feature: Change the number of seats", () => {
  let testApp: TestApp;
  let app: Application;

  beforeEach(async () => {
    testApp = new TestApp();
    await testApp.setup();
    await testApp.loadAllFixtures([
      e2eUsers.johnDoe,
      e2eConference.conference1,
    ]);
    app = testApp.expressApp;
  });

  afterAll(async () => {
    await testApp.tearDown();
  });

  describe("Scenario: Happy path", () => {
    it("should change the number of seats", async () => {
      const seats = 100;
      const id = "id-1";

      const result = await request(app)
        .patch(`/conference/seats/${id}`)
        .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken())
        .send({ seats });

      expect(result.status).toBe(200);

      const conferenceRepository = container.resolve(
        "conferenceRepository"
      ) as IConferenceRepository;
      const fetchedConference = await conferenceRepository.findById(id);

      expect(fetchedConference).toBeDefined();
      expect(fetchedConference?.props.seats).toEqual(seats);
    });
  });

  describe("Scenario: User is not authorized", () => {
    it("should return 403 Unauthorized", async () => {
      const seats = 100;
      const id = "id-1";

      const result = await request(app)
        .patch(`/conference/seats/${id}`)
        .send({ seats });

      expect(result.status).toBe(403);
    });
  });
});
