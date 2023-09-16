import "reflect-metadata";
import express from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import cors from 'cors';
import { RouteHandler } from './startup/route.handler';
import { logger } from './logger/logger';
import { ConfigurationManager } from "./config/configuration.manager";
import { Scheduler } from './startup/scheduler';
import { Seeder } from './startup/seeder';
import { DatabaseConnector } from "./database/database.connector";
import { FactsDatabaseConnector } from "./modules/fact.extractors/facts.db.connector";
import { HttpLogger } from "./logger/HttpLogger";
import { Injector } from "./startup/injector";

/////////////////////////////////////////////////////////////////////////

export default class Application {

    //#region Construction

    public _expressApp: express.Application = null;

    private _routeHandler: RouteHandler = null;

    private static _instance: Application = null;


    private constructor() {
        this._expressApp = express();
        this._routeHandler = new RouteHandler(this._expressApp);
    }

    public static instance(): Application {
        return this._instance || (this._instance = new this());
    }

    //#endregion
    
    public app(): express.Application {
        return this._expressApp;
    }

    public start = async(): Promise<void> => {
        try {
            await this.warmUp();
            await this.listen();
        }
        catch (error){
            logger.error('An error occurred while starting reancare-api service.' + error.message);
        }
    };

    warmUp = async () => {
        try {
            await Injector.registerInjections();
            await DatabaseConnector.setup();
            await FactsDatabaseConnector.setup();
            await this.setupMiddlewares();
            await this.setupRoutes();
            await Seeder.seed();
            await Scheduler.instance().schedule();
        }
        catch (error) {
            logger.error('An error occurred while warming up.' + error.message);
        }
    };

    private setupMiddlewares = async (): Promise<boolean> => {

        return new Promise((resolve, reject) => {
            try {
                this._expressApp.use(express.urlencoded({ extended: true }));
                this._expressApp.use(express.json());
                this._expressApp.use(helmet());
                this._expressApp.use(cors({
                    origin: '*', //Allow all origins, change this to restrict access to specific origins
                }));
                if (ConfigurationManager.UseHTTPLogging) {
                    HttpLogger.use(this._expressApp);
                }

                const MAX_UPLOAD_FILE_SIZE = ConfigurationManager.MaxUploadFileSize;

                this._expressApp.use(fileUpload({
                    limits            : { fileSize: MAX_UPLOAD_FILE_SIZE },
                    preserveExtension : true,
                    createParentPath  : true,
                    parseNested       : true,
                    useTempFiles      : true,
                    tempFileDir       : '/tmp/uploads/'
                }));
                resolve(true);
            }
            catch (error) {
                reject(error);
            }
        });
    };

    private setupRoutes = async (): Promise<boolean> => {
        return await this._routeHandler.init();
    };

    private listen = () => {
        return new Promise((resolve, reject) => {
            try {
                const port = process.env.PORT;
                const server = this._expressApp.listen(port, () => {
                    const serviceName = `${process.env.SERVICE_NAME}-[${process.env.NODE_ENV}]`;
                    logger.info(serviceName + ' is up and listening on port ' + process.env.PORT.toString());
                    this._expressApp.emit("server_started");
                });
                module.exports.server = server;
                resolve(this._expressApp);
            }
            catch (error) {
                reject(error);
            }
        });
    };

}
