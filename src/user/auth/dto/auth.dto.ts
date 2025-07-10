import { UserType } from "@prisma/client";
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from "class-validator";

// This is not a DTO but a validator
export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {
    message: `phone no must be a valid phone no`,
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(5)
  @IsString()
  @IsNotEmpty()
  password: string;
  
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  productKey?: string;
}

export class SigninDTO {
  @IsString()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @IsNotEmpty()
  password: string
}

export class GenerateProductkeyDTO {
  @IsString()
  @IsNotEmpty()
  email: string;
  
  @IsNotEmpty()
  @IsEnum(UserType)
  userType: UserType
}