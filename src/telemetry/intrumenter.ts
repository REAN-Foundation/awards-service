import { NodeSDK, NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ExpressInstrumentation, ExpressLayerType } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { Span, SpanKind, context, trace } from '@opentelemetry/api';

///////////////////////////////////////////////////////////////////////////

const TELEMETRY_ENABLED = process.env.ENABLE_TELEMETRY === 'true' ? true : false;

export class Telemetry {

    private static _instance: Telemetry = null;

    private _sdk: NodeSDK = null;

    private constructor() {
        console.info('Initializing the telemetry...');
    }

    public static instance(): Telemetry {
        return this._instance || (this._instance = new this());
    }

    public start = async (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                if (!TELEMETRY_ENABLED) {
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
                if (!TELEMETRY_ENABLED) {
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

    public details = () => {
        console.log('Telemetry details\n');
        console.log('Telemetry enabled: ', TELEMETRY_ENABLED);
        console.log('Service resource : ', getServiceName());
        console.log('Trace Exporter   : ', 'Console');
        console.log('Metric Exporter  : ', 'None');
    };

    private getTelemetryOptions = (): Partial<NodeSDKConfiguration> => {

        const serviceName = getServiceName();

        //Use this...
        // const traceExporter = getOTLPExporter();
        //else use this...
        //const traceExporter = getZipkinExporter();
        //else use this...
        const traceExporter = new ConsoleSpanExporter();

        const resource = new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        });

        //Metrics reader
        // const metricReader: MetricReader = new PeriodicExportingMetricReader({
        //     exporter: new ConsoleMetricExporter(),
        // });
        //or use this...
        //  const metricReader: MetricReader = new PeriodicExportingMetricReader({
        //     exporter: new OTLPMetricExporter({
        //       url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
        //       headers: {}, // an optional object containing custom headers to be sent with each request
        //     }),
        //   });

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
            }),
            new ExpressInstrumentation({
                ignoreLayersType: [
                    ExpressLayerType.MIDDLEWARE,
                    ExpressLayerType.ROUTER,
                ],
            }),
        ];

        const options: Partial<NodeSDKConfiguration> = {
            //serviceName: serviceName,
            resource: resource,
            traceExporter: traceExporter,
            //metricReader: metricReader,
            instrumentations: instrumentations,
        };
        return options;
    };

}

(async () => {
    await Telemetry.instance().start();
    //console.info('Telemetry initialized...');
})();

export function getServiceName() {
    const environment = process.env.NODE_ENV ?? '';
    const name = process.env.SERVICE_NAME ?? 'Awards-service';
    const serviceName = `${name}-${environment}`;
    return serviceName;
}

////////////////////////////////////////////////////////////////////////////////
//Exporters

export const getZipkinExporter = (): ZipkinExporter => {
    const exporterUrl = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? 'http://localhost:9411/api/v2/spans';
    const options = {
        headers: {
            //'custom-header': 'header-value',
        },
        url: exporterUrl,
    };
    return new ZipkinExporter(options);
};

export const getOTLPExporter = (): OTLPTraceExporter => {
    const exporterUrl = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? 'http://localhost:4317'; // or http://localhost:4318/v1/traces
    const options = {
        headers: {
            //'custom-header': 'header-value',
        },
        url: exporterUrl,
    };
    return new OTLPTraceExporter(options);
};

////////////////////////////////////////////////////////////////////////////////

export function Trace(operationName: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            if (!TELEMETRY_ENABLED) {
                return originalMethod.apply(this, args);
            }
            const serviceName = getServiceName();
            const tracer = trace.getTracer(serviceName);
            //const parentSpan = trace.getSpan(context.active());
            const parentSpan = trace.getActiveSpan();
            const span = tracer.startSpan(operationName);
            const spanContext = trace.setSpan(context.active(), span);
            // context.with(spanContext, () => {
            //     const result = originalMethod.apply(this, args);
            //     span.end();
            //     return result;
            // });
            try {
                return originalMethod.apply(this, args);
            }
            catch (error) {
                span.recordException(error);
                throw error;
            }
            finally {
                span.end();
            }
        };
        return descriptor;
    };
}

export const startSpan = (operationName: string): Span => {

    if (!TELEMETRY_ENABLED) {
        return null;
    }
    const serviceName = getServiceName();
    const tracer = trace.getTracer(serviceName);
    const parentSpan = trace.getActiveSpan();

    // const parentSpanContext = parentSpan ? trace.setSpan(context.active(), parentSpan) : null;
    // const span = parentSpanContext ? 
    //     tracer.startSpan(operationName, 
    //         { 
    //             kind: SpanKind.INTERNAL,
    //         },
    //         parentSpanContext)
    //     : tracer.startSpan(operationName);

    const span = tracer.startSpan(operationName);
    const spanContext = trace.setSpan(context.active(), span);

    return span;
}

export const endSpan = (span: Span): void => {
    if (!TELEMETRY_ENABLED || !span) {
        return;
    }
    span.end();
}

export const recordSpanException = (span: Span, error: Error): void => {
    if (!TELEMETRY_ENABLED || !span) {
        return;
    }
    span.recordException(error);
}

////////////////////////////////////////////////////////////////////////////////
