import { Test, TestingModule } from '@nestjs/testing';
import { homeSelect, HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: "077fae04-29ce-4621-99b2-5ac3d52c474d",
    address: '2345 William Str',
    city: 'Toronto',
    price: 1500000,
    propertyType: PropertyType.RESIDENTIAL,
    image: 'img1',
    numberOfBedrooms: 3,
    numberOfBathrooms: 2.5,
    images: [
      {
        url: 'src1',
      },
    ],
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeService, {
        provide: PrismaService,
        useValue: {
          home: {
            findMany: jest.fn().mockReturnValue(mockGetHomes)
          }
        }
      }],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("getHomes", () => {

    const filters = {
      city: "Toronto",
      price: {
        gte: 1000000,
        lte: 1500000,
      },
      propertyType: PropertyType.RESIDENTIAL
    }
    it("should call prisma fnidMany with correct params", async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes)

      jest.spyOn(prismaService.home, "findMany").mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      });
    });
    it("should throw not found exception if not homes are found", async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest.spyOn(prismaService.home, "findMany").mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(NotFoundException);
    })
  })
});
