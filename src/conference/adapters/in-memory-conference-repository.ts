import { Conference } from "../entities/conference.entity";
import { IConferenceRepository } from "../ports/conference-repository.interface";

export class InMemoryConferenceRepository implements IConferenceRepository {
  database: Conference[] = [];

  async create(conference: Conference): Promise<void> {
    this.database.push(conference);
  }

  async findById(id: string): Promise<Conference | null> {
    const conference = this.database.find((conf) => conf.props.id === id);

    return conference ? new Conference({ ...conference.initialState }) : null;
  }

  async update(conference: Conference): Promise<void> {
    const index = this.database.findIndex(
      (conf) => conf.props.id === conference.props.id
    );
    this.database[index] = conference;
    conference.commit();
  }
}
