import client from 'prom-client';
import { Logger } from '../shared/logger';

export const registerM = new client.Registry();
client.collectDefaultMetrics({
  //app: 'node-application-monitoring-app',
  prefix: 'node_',
  //timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register: registerM,
});
export const http_request_duration_milliseconds = new client.Histogram({
  name: 'http_request_duration_milliseconds',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'statusCode', 'originalUrl'],
  buckets: [1, 10, 50, 100, 200, 500, 1000],
});
registerM.registerMetric(http_request_duration_milliseconds);
Logger.info('Prometheus metrics registered');
