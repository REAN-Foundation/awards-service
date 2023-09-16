import "reflect-metadata";
import express from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import cors from 'cors';
import { Router } from './startup/router';
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

    //#region Member variables

    public _app: express.Application = null;

    private _router: Router = null;

    private static _instance: Application = null;

    //#endregion

    private constructor() {
        this._app = express();
        this._router = new Router(this._app);
    }

    public static instance(): Application {
        return this._instance || (this._instance = new this());
    }

    public app(): express.Application {
        return this._app;
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
                this._app.use(express.urlencoded({ extended: true }));
                this._app.use(express.json());
                this._app.use(helmet());
                this._app.use(cors({
                    origin: '*', //Allow all origins, change this to restrict access to specific origins
                }));
                if (ConfigurationManager.UseHTTPLogging) {
                    HttpLogger.use(this._app);
                }

                const MAX_UPLOAD_FILE_SIZE = ConfigurationManager.MaxUploadFileSize;

                this._app.use(fileUpload({
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
        return await this._router.init();
    };

    private listen = () => {
        return new Promise((resolve, reject) => {
            try {
                const port = process.env.PORT;
                const server = this._app.listen(port, () => {
                    const serviceName = `${process.env.SERVICE_NAME}-[${process.env.NODE_ENV}]`;
                    logger.info(serviceName + ' is up and listening on port ' + process.env.PORT.toString());
                    this._app.emit("server_started");
                });
                module.exports.server = server;
                resolve(this._app);
            }
            catch (error) {
                reject(error);
            }
        });
    };

}
