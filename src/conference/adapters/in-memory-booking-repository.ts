import { Booking } from "../entities/booking.entity";
import { IBookingRepository } from "../ports/booking-repository.interface";

export class InMemoryBookingRepository implements IBookingRepository {
  public database: Booking[] = [];

  async create(booking: Booking): Promise<void> {
    this.database.push(booking);
  }

  async findByConferenceId(id: string): Promise<Booking[]> {
    return this.database.filter((booking) => booking.props.conferenceId === id);
  }

  async findByConferenceIdAndUserId(
    conferenceId: string,
    userId: string
  ): Promise<Booking> {
    return this.database.filter(
      (booking) =>
        booking.props.conferenceId === conferenceId &&
        booking.props.userId === userId
    )[0];
  }
}
