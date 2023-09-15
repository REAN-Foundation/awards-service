// import dotenv from 'dotenv';
// dotenv.config();

// const process = require('process');
import { NodeSDK, NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
//import { PeriodicExportingMetricReader, ConsoleMetricExporter, MetricReader } from '@opentelemetry/sdk-metrics';
import { ExpressInstrumentation, ExpressLayerType } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
//import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
//import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
//import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';

// import { logger } from '../logger/logger';

///////////////////////////////////////////////////////////////////////////

export class Telemetry {

    private static _instance: Telemetry = null;

    private _sdk:NodeSDK  = null;

    private _enabled:boolean = process.env.ENABLE_TELEMETRY === 'true' ? true : false;

    private constructor() {
        console.info('Initializing the telemetry...');
    }

    public static instance(): Telemetry {
        return this._instance || (this._instance = new this());
    }

    public start = async (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                if (!this._enabled) {
                    console.info('Telemetry is disabled. Skipping initialization...');
                    resolve(true);
                    return;
                }
                const options = this.getTelemetryOptions();
                this._sdk = new NodeSDK(options);
                this._sdk.start();
                resolve(true);
            } catch (error) {
                console.error('Error initializing the scheduler.: ' + error.message);
                reject(false);
            }
        });
    };

    public shutdown = async (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                if (!this._enabled) {
                    console.info('Telemetry is disabled. Skipping shutdown...');
                    resolve(true);
                    return;
                }
                this._sdk.shutdown();
                resolve(true);
            } catch (error) {
                console.error('Error stopping the scheduler.: ' + error.message);
                reject(false);
            }
        });
    };

    private getTelemetryOptions = (): Partial<NodeSDKConfiguration> => {

        const environment = process.env.NODE_ENV ?? '';
        const name = process.env.SERVICE_NAME ?? 'Awards-service';
        const serviceName = `${name}-${environment}`;

        //Use this...
        // const traceExporter = this.getOTLPExporter();
        //else use this...
        //const traceExporter = this.getZipkinExporter();
        //else use this...
        const traceExporter = new ConsoleSpanExporter();

        const resource = new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        });

        //Metrics reader
        // const metricReader: MetricReader = new PeriodicExportingMetricReader({
        //     exporter: new ConsoleMetricExporter(),
        // });
        
        // const instrumentations = [
        //     // getNodeAutoInstrumentations(),
        //     getNodeAutoInstrumentations({
        //         "@opentelemetry/instrumentation-http": {
        //             //Ignore health-check, docs, swagger, openapi.json requests
        //             ignoreIncomingRequestHook: (req) => {
        //                 return req.url.includes('/health-check') ||
        //                     req.url.includes('/docs') ||
        //                     req.url.includes('/swagger') ||
        //                     req.url.includes('/openapi.json');
        //             },
                    
        //         },
        //         "@opentelemetry/instrumentation-express": {
        //             ignoreLayersType: [
        //                 ExpressLayerType.MIDDLEWARE,
        //                 ExpressLayerType.ROUTER,
        //             ],
        //         },
        //     })
        // ];
        const instrumentations = [
            new HttpInstrumentation({
                            //Ignore health-check, docs, swagger, openapi.json requests
                            ignoreIncomingRequestHook: (req) => {
                                return req.url.includes('/health-check') ||
                                    req.url.includes('/docs') ||
                                    req.url.includes('/swagger') ||
                                    req.url.includes('/openapi.json');
                            },
                            
                        }), // Express instrumentation expects HTTP layer to be instrumented
            new ExpressInstrumentation({
                    ignoreLayersType: [
                        ExpressLayerType.MIDDLEWARE,
                        ExpressLayerType.ROUTER,
                    ],
                }),
        ];

        const options: Partial<NodeSDKConfiguration>  = {
            // serviceName: serviceName,
            resource: resource,
            traceExporter: traceExporter,
            //metricReader: metricReader,
            instrumentations: instrumentations,
        }
        return options;
    };

    // private getZipkinExporter = (): ZipkinExporter => {
    //     const exporterUrl = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? 'http://localhost:9411/api/v2/spans';
    //     const options = {
    //         headers: {
    //             //'custom-header': 'header-value',
    //         },
    //         url: exporterUrl,
    //     };
    //     return new ZipkinExporter(options);
    // };

    // private getOTLPExporter = (): OTLPTraceExporter => {
    //     const exporterUrl = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? 'http://localhost:4317'; // or http://localhost:4318/v1/traces
    //     const options = {
    //         headers: {
    //             //'custom-header': 'header-value',
    //         },
    //         url: exporterUrl,
    //     };
    //     return new OTLPTraceExporter(options);
    // };

}

Telemetry.instance().start();
