import { HealthUseCase, PingUseCase } from '../ports/in/health.use-case.ts';

/**
 * Creates the Health Use Case implementation.
 * Following the functional-first hexagonal architecture.
 */
export const makeHealthService = (): HealthUseCase => () => {
  return Promise.resolve({
    status: 'UP',
    date: new Date().toISOString(),
  });
};

/**
 * Creates the Ping Use Case implementation.
 */
export const makePingService = (): PingUseCase => () => {
  return Promise.resolve('pong');
};
