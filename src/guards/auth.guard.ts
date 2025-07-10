import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, } from "@nestjs/common";
import { Reflector } from "@nestjs/core"; // The reflector allows us to access metadata.
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from "@prisma/client";


interface JWTPayload {
    name: string;
    id: string;
    userType: UserType;
    iat: number;
    exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService
    ) { }

    // the context helps us get the incoming requests 
    // as well somr other information
    async canActivate(context: ExecutionContext) {
        // 1. determine the UserTypes that can execute the called endpoint
        const roles = this.reflector.getAllAndOverride("roles", [
            context.getHandler(), // get data from the handler
            context.getClass() // get metadata from classes
        ]);

        console.log(roles)
        /* 
        2. Grab the JWT from the request header & verify it,
        if there are roles inside of the roles Array 
        else no need to be authenticated in order to execute
        the end point so there might be no JWT inside of the request header.
        */
        if (roles?.length) {
            const request = context.switchToHttp().getRequest();
            const token = request.headers?.authorization?.split("Bearer ")[1]
            try {
                const jwtConfig = this.configService.get<string>("JWT_SECRET");

                if (!jwtConfig) {
                    throw new InternalServerErrorException("There is no token detected from the server.")
                };
                const user_payload = jwt.verify(token, jwtConfig) as JWTPayload
                // console.log({ "payload": user_payload })
                
                // 3. Database request to get user id
                const user = await this.prismaService.user.findUnique({
                    where: {
                        id: user_payload.id
                    }
                });
                if (!user) return false;

                // console.log({ "user": user });

                // 4. Determine if the User has Permission
                if (roles.includes(user.user_type)) return true;

                return false;
            } catch (error) {
                return false
            }
        }

        return true;
    }
} 