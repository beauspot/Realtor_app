import { PropertyType } from "@prisma/client";
import {
    Exclude,
    Expose,
    Transform,
    Type
} from "class-transformer";

import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    ValidateNested
} from "class-validator"

export class HomeResponseDTO {
    id: string;
    address: string;

    @Exclude()
    number_of_bedrooms: number;

    @Expose({ name: 'numberOfBedrooms' })
    numberOfBedrooms() {
        return this.number_of_bedrooms;
    }

    @Exclude()
    number_of_bathrooms: number;

    @Expose({ name: 'numberOfBathrooms' })
    numberOfBathrooms() {
        return this.number_of_bathrooms;
    }

    city: string;

    @Exclude()
    listed_date: Date;

    @Expose({ name: 'listedDate' })
    listedDate() {
        return this.listedDate;
    }

    price: number;

    image: string;

    @Exclude()
    land_size: number;

    @Expose({ name: 'landSize' })
    landSize() {
        return this.landSize;
    }
    propertyType: PropertyType;

    @Exclude()
    created_at: Date;
    @Exclude()
    updated_at: Date;
    @Exclude()
    realtor_id: string;

    constructor(paritial: Partial<HomeResponseDTO>) {
        Object.assign(this, paritial);
    }
}
  

class Image {
    @Expose()
    id: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    url: string;

    @Exclude()
    home_id: string;

    constructor(partial: Partial<Image>) {
        Object.assign(this, partial);
    }
}

export class CreateHomeDTO {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsNumber()
    @IsPositive()
    numberOfBedrooms: number;

    @IsNumber()
    @IsPositive()
    numberOfBathrooms: number;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    landSize: number;

    @IsEnum(PropertyType)
    propertyType: PropertyType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Image)
    images: Image[];
}

export class UpdateHomeDTO {
    @IsOptional()
    @IsNotEmpty()
    address?: string;

    @IsOptional()
    @IsString()
    @IsNumber()
    @IsPositive()
    numberOfBedrooms?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    numberOfBathrooms?: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    city?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    landSize?: number;

    @IsOptional()
    @IsEnum(PropertyType)
    propertyType?: PropertyType;
}