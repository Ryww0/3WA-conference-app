import { Executable } from "../../core/executable.interface";
import { IMailer } from "../../core/ports/mailer.interface";
import { InMemoryUserRepository } from "../../user/adapters/in-memory-user-repository";
import { User } from "../../user/entities/user.entity";
import { Booking } from "../entities/booking.entity";
import { Conference } from "../entities/conference.entity";
import { IBookingRepository } from "../ports/booking-repository.interface";

type ReserveRequest = {
  user: User;
  conference: Conference;
};

export class ReserveSeats implements Executable<ReserveRequest, void> {
  constructor(
    private readonly repository: IBookingRepository,
    private readonly mailer: IMailer
  ) {}

  async execute({ user, conference }): Promise<void> {
    const newBooking = new Booking({
      userId: user.props.id,
      conferenceId: conference.props.id,
    });

    const bookings = await this.repository.findByConferenceId(
      conference.props.id
    );

    const existingBooking = bookings.find(
      (booking) => booking.props.userId === user.props.id
    );

    if (existingBooking) {
      throw new Error("User already booked this conference.");
    }

    if (bookings.length >= conference.props.seats) {
      throw new Error("The conference has no more seats left.");
    }

    await this.repository.create(newBooking);
    // await this.sendEmailToConfirmReservation(user, conference); // NOT WORKING
  }

  async sendEmailToConfirmReservation(
    user: User,
    conference: Conference
  ): Promise<void> {
    await this.mailer.send({
      from: "TEDx conference",
      to: user.props.emailAddress,
      subject: "Booking conference confirmation",
      body: `We confirm you that the booking of the conference ${conference.props.title} has been accepted.`,
    });
  }

  async sendEmailToOrganizer(
    user: User,
    conference: Conference
  ): Promise<void> {
    await this.mailer.send({
      from: "TEDx conference",
      to: user.props.emailAddress,
      subject: "Booking conference confirmation",
      body: `A new user just booked the conference ${conference.props.title}`,
    });
  }
}
