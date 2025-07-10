import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

import { UserType } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

interface SignupParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface SinginParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService) { }
  
  async Signup({ name, email, phone, password }: SignupParams, userType: UserType) {
    // checking if the user exists with a unique phone no and email
    const userExists = await this.prismaService.user.findUnique({
      where: {
        phone,
        email,
      },
    });
    // console.log({ userExists });
    if (userExists) throw new ConflictException();

    const hashPwd = await bcrypt.hash(password, 10);

    // Save the user to the database
    const newUser = await this.prismaService.user.create({
      data: {
        name,
        email,
        phone,
        password: hashPwd,
        user_type: userType,
      },
    });

    const token = this.generateJWT(newUser.id, name, userType)
    return { newUser,  token};
  }

  async SignIn({email, password}: SinginParams){
    // check if the user exists with a unique email
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      }
    });

    if (!userExists) throw new UnauthorizedException("This Uses does not exists");

    const comparedPwd = await bcrypt.compare(password, userExists.password);

    if (!comparedPwd) throw new UnauthorizedException("Invallid credentials")
    
    const token = this.generateJWT(userExists.id, userExists.name, UserType.BUYER)

    return { userExists, token };
  }

  private generateJWT(id: string, name: string, user_type: UserType) {
    const jwtSecret = this.configService.get<string>("JWT_SECRET");
    if(!jwtSecret) throw new InternalServerErrorException("There is no token detected from the server.")
    return jwt.sign(
      { id, name, user_type },
      jwtSecret,
      { expiresIn: 3600000 }
    );
  }

  async generateProductKey(email: string, userType: UserType) {
    const ProductSecretKey = this.configService.get<string>("PRODUCT_SECRET_KEY");
    if (!ProductSecretKey) throw new InternalServerErrorException("There is no token detected from the server");
    const hash_string = `${email}-${userType}-${ProductSecretKey}`
    const hashedData = await bcrypt.hash(hash_string, 10);
    return { 
      [`${email} - ${userType}`]: hashedData
    }
  }
}
