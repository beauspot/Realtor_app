import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * The createParamDecorator is a decorator used for 
 * creating a parameter decorator.
 */

export interface userInfo {
    name: string,
    id: string,
    iat: number,
    exp: number,
}
export const User = createParamDecorator(function (data, context: ExecutionContext) {
    // Extract the user from request.user
    const request = context.switchToHttp().getRequest();
    return request.user;
})