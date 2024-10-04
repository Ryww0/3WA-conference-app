import { Model } from "mongoose";
import { Conference } from "../../entities/conference.entity";
import { IConferenceRepository } from "../../ports/conference-repository.interface";
import { MongoConference } from "./mongo-conference";
import { ConferenceNotFoundException } from "../../exceptions/conference-not-found";

class ConferenceMapper {
  toCore(model: MongoConference.ConferenceDocument): Conference {
    return new Conference({
      id: model._id,
      organizerId: model.organizerId,
      title: model.title,
      seats: model.seats,
      startDate: model.startDate,
      endDate: model.endDate,
    });
  }

  toPersistence(conference: Conference): MongoConference.ConferenceDocument {
    return new MongoConference.ConferenceModel({
      _id: conference.props.id,
      organizerId: conference.props.organizerId,
      title: conference.props.title,
      seats: conference.props.seats,
      startDate: conference.props.startDate,
      endDate: conference.props.endDate,
    });
  }
}

export class MongoConferenceRepository implements IConferenceRepository {
  private readonly mapper = new ConferenceMapper();

  constructor(
    private readonly model: Model<MongoConference.ConferenceDocument>
  ) {}

  async create(conference: Conference): Promise<void> {
    const record = this.mapper.toPersistence(conference);
    await record.save();
  }

  async findById(id: string): Promise<Conference | null> {
    const conference = await this.model.findOne({ _id: id });
    if (!conference) return null;
    return this.mapper.toCore(conference);
  }

  async update(conference: Conference): Promise<void> {
    const updatedConference = await this.model.findOneAndUpdate(
      { _id: conference.props.id },
      {
        $set: {
          title: conference.props.title,
          seats: conference.props.seats,
          startDate: conference.props.startDate,
          endDate: conference.props.endDate,
        },
      },
      { new: true }
    );

    if (!updatedConference) throw new ConferenceNotFoundException();
  }
}
