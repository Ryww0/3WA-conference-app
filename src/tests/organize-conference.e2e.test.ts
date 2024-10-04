import { addDays, addHours } from "date-fns";
import { Application } from "express";
import request from "supertest";
import { IConferenceRepository } from "../conference/ports/conference-repository.interface";
import container from "../infrastructure/express_api/config/dependency-injection";
import { e2eUsers } from "./seeds/user-seeds";
import { TestApp } from "./utils/test-app";

describe("Feature: Organize Conference", () => {
  let testApp: TestApp;
  let app: Application;

  beforeEach(async () => {
    testApp = new TestApp();
    await testApp.setup();
    await testApp.loadAllFixtures([e2eUsers.johnDoe]);
    app = testApp.expressApp;
  });

  afterAll(async () => {
    await testApp.tearDown();
  });

  it("should organize a conference", async () => {
    const startDate = addDays(new Date(), 4);
    const endDate = addDays(addHours(new Date(), 2), 4);

    const result = await request(app)
      .post("/conference")
      .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken())
      .send({
        title: "My first conference",
        seats: 100,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

    expect(result.status).toBe(201);
    expect(result.body.data).toEqual({ id: expect.any(String) });

    const conferenceRepository = container.resolve(
      "conferenceRepository"
    ) as IConferenceRepository;
    const fetchedConference = await conferenceRepository.findById(
      result.body.data.id
    );

    expect(fetchedConference).toBeDefined();
    expect(fetchedConference?.props).toEqual({
      id: result.body.data.id,
      organizerId: e2eUsers.johnDoe.entity.props.id,
      title: "My first conference",
      seats: 100,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  });
});
