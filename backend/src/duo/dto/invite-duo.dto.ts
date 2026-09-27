import { IsEmail } from "class-validator";

export class InviteDuoDto {
    @IsEmail()
    email: string;
}