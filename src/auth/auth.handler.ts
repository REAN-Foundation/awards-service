import { Request, Response, NextFunction } from 'express';
import { UserAuthorizer } from './wrappers/user.authorizer';
import { UserAuthenticator } from './wrappers/user.authenticator';
import { Loader } from '../startup/loader'
import { ClientAuthenticator } from './wrappers/client.authenticator';
import { ErrorHandler } from '../common/handlers/error.handler';

////////////////////////////////////////////////////////////////////////
export type AuthMiddleware = (request: Request, response: Response, next: NextFunction) => Promise<void>;
////////////////////////////////////////////////////////////////////////

export class AuthHandler {

    public static handle = (
        context:string, 
        authenticateClient = true, 
        authenticateUser = true, 
        authorizeUser = true): AuthMiddleware[] => {

        var middlewares: AuthMiddleware[] = [];

        //Set context
        var contextSetter = async (request: Request, response: Response, next: NextFunction) => {
            request.context = context;
            const tokens = context.split('.');
            if (tokens.length < 2) {
                ErrorHandler.throwInternalServerError('Invalid request context');
            }
            const resourceType = tokens[0];
            request.context = context;
            request.resourceType = resourceType;
            if (request.params.id !== undefined && request.params.id !== null) {
                request.resourceId = request.params.id;
            }
            next();
        };
        middlewares.push(contextSetter);

        //Line-up the auth middleware chian
        if (authenticateClient) {
            var clientAuthenticator = Loader.Container.resolve(ClientAuthenticator);
            middlewares.push(clientAuthenticator.authenticate);
        }
        if (authenticateUser) {
            var userAuthenticator = Loader.Container.resolve(UserAuthenticator);
            middlewares.push(userAuthenticator.authenticate);
        }
        if (authorizeUser) {
            var authorizer = Loader.Container.resolve(UserAuthorizer);
            middlewares.push(authorizer.authorize);
        }

        return middlewares;
    }

    public static verifyAccess = async(request: Request): Promise<boolean> => {

        var clientAuthenticator = Loader.Container.resolve(ClientAuthenticator);
        const clientVerified = await clientAuthenticator.verify(request);
        if (clientVerified === false){
            ErrorHandler.throwInternalServerError('Unauthorized access', 401);
        }

        var userAuthenticator = Loader.Container.resolve(UserAuthenticator);
        const userVerified = await userAuthenticator.verify(request);
        if (userVerified === false){
            ErrorHandler.throwInternalServerError('Unauthorized access', 401);
        }

        var userAuthorizer = Loader.Container.resolve(UserAuthorizer);
        const authorized = await userAuthorizer.verify(request);
        if (authorized === false){
            ErrorHandler.throwUnauthorizedUserError('Unauthorized access');
        }
        return true;
    };

    public static generateUserSessionToken = async (user: any): Promise<string> => {
        var authorizer = Loader.Container.resolve(UserAuthorizer);
        return await authorizer.generateUserSessionToken(user);
    };

}
