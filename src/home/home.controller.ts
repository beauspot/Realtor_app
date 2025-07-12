import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  ParseUUIDPipe,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDTO, CreateHomeDTO, UpdateHomeDTO, InquireDTO } from "./dto/home.dto";
import { PropertyType, UserType } from '@prisma/client';
import { User, userInfo } from "../user/decorators/users.decorator"
import { Roles } from 'src/decorators/role.decorator';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) { }

  @Get()
  getHomes(
    // Using Query Parameters in nest.js
    @Query("city") city?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("propertyType") propertyType?: PropertyType,
  ): Promise<HomeResponseDTO[]> {

    const price = minPrice || maxPrice ? {
      ...(minPrice && { gte: parseFloat(minPrice) }),
      ...(maxPrice && { lte: parseFloat(maxPrice) }),
    } : undefined
    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType })
    }
    return this.homeService.getHomes(filters)
  }

  @Get(":id")
  getHome(@Param("id", ParseUUIDPipe) id: string) {
    return this.homeService.getHomeByID(id)
  }

  @Roles(UserType.REALTOR)
  @Post()
  createHome(@Body() body: CreateHomeDTO, @User() user: userInfo) {
    // console.log(user)
    // return "Hello this is from the interceptor"
    // return "Hello this is from the guard"
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.REALTOR)
  @Put(":id")
  async updateHome(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateHomeDTO,
    @User() user: userInfo
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user.id) { throw new UnauthorizedException() }

    return this.homeService.updateHomeById(id, body);
  }

  @Roles(UserType.REALTOR)
  @Delete(":id")
  async deleteHome(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: userInfo
  ) {
    const realtorId = await this.homeService.getRealtorByHomeId(id);

    if (realtorId.id !== user.id) { throw new UnauthorizedException() }
    return this.homeService.deletehomeById(id);
  }

  @Roles(UserType.BUYER)
  @Post("/:id/inquire")
  inquire(
    @Param("id", ParseUUIDPipe) homeId: string,
    @User() user: userInfo,
    @Body() { message }: InquireDTO
  ) {
    return this.homeService.inquire(user, homeId, message)
  }

  @Roles(UserType.REALTOR)
  @Get("/:id/messages")
  async getHomeMessages(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: userInfo,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    // console.log({"realtor": realtor})
    if (realtor.id !== user.id) {
      // console.log({"realtor_id": realtor.id})
      // console.log({"user_id": user.id})
      throw new UnauthorizedException()
    };

    return this.homeService.getMessagesByHome(id)
  }
}
