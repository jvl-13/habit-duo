import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateHabitDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name? : string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description? : string;

    @IsOptional()
    @IsString()
    deadline?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsBoolean()
    isActive? : boolean;
}