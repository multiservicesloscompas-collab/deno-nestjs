import { Controller, Get, Inject } from '@nestjs/common';
import { HEALTH_USE_CASE, PING_USE_CASE } from '../../context/health/application/ports/in/health.use-case.ts';
import type { HealthUseCase, PingUseCase } from '../../context/health/application/ports/in/health.use-case.ts';

@Controller()
export class HealthController {
  constructor(
    @Inject(HEALTH_USE_CASE)
    private readonly healthUseCase: HealthUseCase,
    @Inject(PING_USE_CASE)
    private readonly pingUseCase: PingUseCase,
  ) {}

  @Get('health')
  health() {
    return this.healthUseCase();
  }

  @Get('ping')
  ping() {
    return this.pingUseCase();
  }
}
