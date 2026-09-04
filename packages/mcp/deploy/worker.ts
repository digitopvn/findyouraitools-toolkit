import { createHttpApp } from '../src/transports/http';

const app = createHttpApp();

export default {
  fetch(request: Request): Response | Promise<Response> {
    return app.fetch(request);
  },
};
