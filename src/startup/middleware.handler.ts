import express from "express";
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import cors from 'cors';
import { ConfigurationManager } from "../config/configuration.manager";
import { HttpLogger } from "../logger/HttpLogger";
import { logger } from "../logger/logger";

////////////////////////////////////////////////////////////////////////////////////

export class MiddlewareHandler {

    public static setup = async (expressApp: express.Application): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                expressApp.use(express.urlencoded({ extended: true }));
                expressApp.use(express.json());
                expressApp.use(helmet());
                expressApp.use(cors({
                    origin: '*', //Allow all origins, change this to restrict access to specific origins
                }));
                if (ConfigurationManager.UseHTTPLogging) {
                    HttpLogger.use(expressApp);
                }

                const MAX_UPLOAD_FILE_SIZE = ConfigurationManager.MaxUploadFileSize;

                expressApp.use(fileUpload({
                    limits            : { fileSize: MAX_UPLOAD_FILE_SIZE },
                    preserveExtension : true,
                    createParentPath  : true,
                    parseNested       : true,
                    useTempFiles      : true,
                    tempFileDir       : '/tmp/uploads/'
                }));

                //Your custom middlewares go here

                resolve(true);
            }
            catch (error) {
                logger.error('Error initializing the middlewares: ' + error.message);
                reject(error);
            }
        });
    };

    //Add your custom middlewares here
    //...

}
