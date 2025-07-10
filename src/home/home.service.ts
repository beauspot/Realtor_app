import { Injectable, NotFoundException } from '@nestjs/common';
import { HomeResponseDTO } from "./dto/home.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PropertyType } from '@prisma/client';
import { NotFoundError } from 'rxjs';


interface GetHomesQueryParam {
    city?: string;
    price?: {
        gte?: number;
        lte?: number;
    };
    propertyType?: PropertyType
};

interface CreateHomeParams {
    address: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: PropertyType;
    images: { url: string }[];
  }

interface UpdateHomeParams {
    address?: string;
    numberOfBedrooms?: number;
    numberOfBathrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: PropertyType;
}

export const homeSelect = {
    id: true,
    address: true,
    city: true,
    price: true,
    propertyType: true,
    number_of_bathrooms: true,
    number_of_bedrooms: true,
};
@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService) { }

    async getHomes(filters: GetHomesQueryParam): Promise<HomeResponseDTO[]> {
        const allHomes = await this.prismaService.home.findMany({
            select: {  // 👈 Wrap fields in 'select'
                id: true,
                address: true,
                city: true,
                price: true,
                propertyType: true,  // 👈 Note: lowercase 'p' to match Prisma model
                number_of_bedrooms: true,
                number_of_bathrooms: true,
                images: {
                    select: {
                        url: true
                    },
                    take: 1
                },
            },
            // Performing Filter for Query Parameters
            where: filters
        });

        if (!allHomes.length) throw new NotFoundException();

        return allHomes.map(home => {
            const imageUrl = home.images[0]?.url;

            const homeData = {
                ...home,
                image: imageUrl
            };

            const { images, ...homeWithoutImages } = homeData;

            return new HomeResponseDTO(homeWithoutImages);
        });
    }

    async getHomeByID(id: string) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            },
            select: {
                ...homeSelect,
                images: {
                    select: {
                        url: true,
                    },
                },
                realtor: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
        if (!home) throw new NotFoundException();

        return new HomeResponseDTO(home);
    }

    async createHome(
        {
            address,
            numberOfBathrooms,
            numberOfBedrooms,
            city,
            landSize,
            price,
            propertyType,
            images,
        }: CreateHomeParams,
        userId: string,
    ) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                city,
                land_size: landSize,
                propertyType,
                price,
                realtor_id: userId,
            },
        });

        const homeImages = images.map((image) => {
            return { ...image, home_id: home.id };
        });

        await this.prismaService.image.createMany({
            data: homeImages,
        });

        return new HomeResponseDTO(home);
    }

    async updateHomeById(id: string, data: UpdateHomeParams) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            }
        });

        if (!home) throw new NotFoundException();

        const updateHome = await this.prismaService.home.update({
            where: {
                id,
            },
            data
        });

        return new HomeResponseDTO(updateHome);
    };

    async deletehomeById(id: string) {

        await this.prismaService.image.deleteMany({
            where: {
                home_id: id
            }
        })

        const home = await this.prismaService.home.delete({
            where: {
                id,
            }
        });

        if (!home) throw new NotFoundException(`The home with the ID : ${id} cannot be found.`);

        return new HomeResponseDTO(home)
    }

    async getRealtorByHomeId(id: string) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            },
            select: {
                realtor: {
                    select: {
                        name: true,
                        id: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        if(!home) throw new NotFoundException()

        return home.realtor; 
    }
}
