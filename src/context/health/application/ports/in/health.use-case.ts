import { HealthStatus } from '../../../domain/models/health.model.ts';

export const HEALTH_USE_CASE = Symbol('HEALTH_USE_CASE');
export type HealthUseCase = () => Promise<HealthStatus>;

export const PING_USE_CASE = Symbol('PING_USE_CASE');
export type PingUseCase = () => Promise<string>;
