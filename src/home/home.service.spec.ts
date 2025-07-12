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

const mockCreateHomes = [
  {
    // id: "077fae04-29ce-4621-99b2-5ac3d52c474d",
    address: '2345 William Str',
    city: 'Toronto',
    price: 1500000,
    property_type: PropertyType.RESIDENTIAL,
    image: 'img1',
    number_of_bedrooms: 3,
    number_of_bathrooms: 2.5,
    images: [
      {
        url: 'src1',
      },
    ],
  },
];

const mockImages = [
  {
    id: "78dc98f8-9884-4248-8135-2f6c3c5c65a1",
    urls: "src1"
  },
  {
    id: "74dc98f8-9864-4248-4135-7f6c3c5c65a1",
    urls: "src2"
  },
]

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeService, {
        provide: PrismaService,
        useValue: {
          home: {
            findMany: jest.fn().mockReturnValue(mockGetHomes),
            create: jest.fn().mockReturnValue(mockCreateHomes),
          },
          image: {
            createMany: jest.fn().mockReturnValue(mockImages),
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
    });
  });

  describe("createHome", () => {
    const mockCreateHomeParams = {
      address: '2345 William Str',
      city: 'Toronto',
      price: 1500000,
      propertyType: PropertyType.RESIDENTIAL,
      image: 'img1',
      numberOfBedrooms: 3,
      numberOfBathrooms: 2.5,
      landSize: 5000,
      images: [{
        url: "url1",
      }]
    };
    const mockUserId = "a4b6ba75-f77e-4d7b-aa11-b7468bdf7366"
    it("should call prisma home.create with the correct payload", async () => {
      const mock_create_home = jest.fn().mockReturnValue(mockCreateHomes);

      jest.spyOn(prismaService.home, "create").mockImplementation(mock_create_home);

      await service.createHome(mockCreateHomeParams, mockUserId);

      expect(mock_create_home).toBeCalledWith({
        data: {
          address: '2345 William Str',
          number_of_bathrooms: 2.5,
          number_of_bedrooms: 3,
          city: "Toronto",
          land_size: 5000,
          propertyType: PropertyType.RESIDENTIAL,
          price: 1500000,
          realtor_id: mockUserId
        }
      })
    });

    it("Should call prisma image.createMany with the correct Payload", async () => {
      const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);

      jest.spyOn(prismaService.image, "createMany").mockImplementation(mockCreateManyImage);

      await service.createHome(mockCreateHomeParams, mockUserId);

      expect(mockCreateManyImage).toBeCalledWith({
        data: [
          {
            url: "url1",
            home_id: undefined,
          },
        ]
      }
      )
    })
  });
});
