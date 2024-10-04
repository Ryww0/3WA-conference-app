import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { User } from "../../../user/entities/user.entity";
import { Conference } from "../../../conference/entities/conference.entity";

export class CreateConferenceInputs {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  seats: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}

export class ChangeSeatsInputs {
  @IsNumber()
  @IsNotEmpty()
  seats: number;
}

export class ChangeDatesInputs {
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}

export class CreateBookingInputs {
  @IsNotEmpty()
  user: User;
  @IsNotEmpty()
  conference: Conference;
}
