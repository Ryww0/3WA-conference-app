import { Model } from "mongoose";
import { TestApp } from "../../../tests/utils/test-app";
import { MongoConference } from "./mongo-conference";
import { MongoConferenceRepository } from "./mongo-conference-repository";
import { testConference } from "../../tests/conference-seeds";
import { testUsers } from "../../../user/tests/user-seeds";
import { Conference } from "../../entities/conference.entity";
import { addDays, addHours } from "date-fns";

describe("MongoConferenceRepository", () => {
  let app: TestApp;
  let model: Model<MongoConference.ConferenceDocument>;
  let repository: MongoConferenceRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = MongoConference.ConferenceModel;
    await model.deleteMany({});
    repository = new MongoConferenceRepository(model);

    const record = new model({
      _id: testConference.conference1.props.id,
      organizerId: testUsers.johnDoe.props.id,
      title: testConference.conference1.props.title,
      seats: testConference.conference1.props.seats,
      startDate: testConference.conference1.props.startDate,
      endDate: testConference.conference1.props.endDate,
    });

    await record.save();
  });

  afterEach(async () => {
    await app.tearDown();
  });

  describe("Scenario: create a conference", () => {
    it("should create a conference", async () => {
      await repository.create(testConference.conference2);
      const fetchedConference = await model.findOne({
        _id: testConference.conference2.props.id,
      });

      expect(fetchedConference?.toObject()).toEqual({
        _id: testConference.conference2.props.id,
        organizerId: testUsers.johnDoe.props.id,
        title: testConference.conference2.props.title,
        seats: testConference.conference2.props.seats,
        startDate: testConference.conference2.props.startDate,
        endDate: testConference.conference2.props.endDate,
        __v: 0,
      });
    });
  });

  describe("Scenario: FindById", () => {
    it("should find the conference correspondind to the id", async () => {
      const conference = await repository.findById(
        testConference.conference1.props.id
      );

      expect(conference?.props).toEqual(testConference.conference1.props);
    });

    it("should return null if no user found", async () => {
      const conference = await repository.findById("non-existing-id");
      expect(conference).toBeNull();
    });
  });

  describe("Scenario: Update a conference", () => {
    it("should update the conference", async () => {
      const updateProps = {
        title: "Updated Conference Title",
        seats: 60,
        startDate: addDays(new Date(), 5),
        endDate: addDays(addHours(new Date(), 2), 5),
      };

      const conferenceToUpdate = new Conference({
        ...testConference.conference1.props,
        ...updateProps,
      });

      await repository.update(conferenceToUpdate);
      const updatedConference = await model.findOne({
        _id: testConference.conference1.props.id,
      });

      expect(updatedConference?.toObject()).toEqual({
        _id: testConference.conference1.props.id,
        organizerId: testUsers.johnDoe.props.id,
        title: updateProps.title,
        seats: updateProps.seats,
        startDate: updateProps.startDate,
        endDate: updateProps.endDate,
        __v: 0,
      });
    });

    it("should throw an error if the conference is not found", async () => {
      const nonExistingConference = new Conference({
        id: "non-existing-id",
        organizerId: testUsers.johnDoe.props.id,
        title: "Non-Existing Conference",
        seats: 100,
        startDate: new Date(),
        endDate: new Date(),
      });

      await expect(repository.update(nonExistingConference)).rejects.toThrow(
        "Conference not found"
      );
    });
  });
});
