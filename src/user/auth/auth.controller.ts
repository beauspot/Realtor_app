import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseEnumPipe,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GenerateProductkeyDTO, SigninDTO, SignupDto } from "./dto/auth.dto";
import { UserType } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { User, userInfo } from "../decorators/users.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authservice: AuthService,
    private readonly configService: ConfigService) { }
  @Post("/signup/:userType")
 async signup(@Body() body: SignupDto,
    @Param("userType", new ParseEnumPipe(UserType)) userType: UserType) {
    
    if (userType !== UserType.BUYER) {
      if (!body.productKey) throw new UnauthorizedException("No valid Product Key");

      const product_env_key = this.configService.get<string>("PRODUCT_SECRET_KEY");
      if (!product_env_key) throw new InternalServerErrorException("There is no key detected from the server");
      // generate product key
      const validProductKey = `${body.email}-${userType}-${product_env_key}`;

      // console.log(validProductKey)

      const isValidProductKey = await bcrypt.compare(validProductKey, body.productKey);

      // console.log(isValidProductKey)

      if (!isValidProductKey) throw new UnauthorizedException("The Product Key is not valid.");
    }
    // console.log({ body_data: body.email });
    return this.authservice.Signup(body, userType);
  }

  @Post("/signin")
  signin(@Body() body: SigninDTO) {
    return this.authservice.SignIn(body);
  }

  @Post("/key")
  generateProductKey(
    @Body() body: GenerateProductkeyDTO
  /**@Body() {userType, email}: GenerateProductKeyDTO */) {
    return this.authservice.generateProductKey(body.email, body.userType);
  }

  // This enpoint identifies who is this person making this request
  @Get("/me")
  me(@User() user: userInfo) { 
    return user;
  }
  
}
