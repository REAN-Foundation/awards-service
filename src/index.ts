import dotenv from 'dotenv';
dotenv.config();
import { Telemetry } from './telemetry/telemetry';
import Application from './app';

(async () => {
    await Telemetry.instance().start();
    const app = Application.instance();
    await app.start();
})();
