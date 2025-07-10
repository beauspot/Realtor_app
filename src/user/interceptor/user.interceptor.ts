import { NestInterceptor, Injectable, ExecutionContext, CallHandler } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class UserInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, handler: CallHandler) {

        const request = context.switchToHttp().getRequest();
        // The "?" lets you determine if the request.headers.authorization are undefined
        const token = request?.headers?.authorization?.split("Bearer ")[1]
        // console.log({ token })
        // console.log({request})
        // decode the jwt token 
        const user = jwt.decode(token)
        // console.log({ user })
        // Get user & add to the request.
        request.user = user;
        return handler.handle()
        /**
         * Any code inside here would be intercepting the requests
         * Any code that would be inside the handler itself would be intercepting the response
         */
    }
}