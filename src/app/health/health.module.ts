import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.ts';
import { makeHealthService, makePingService } from '../../context/health/application/services/health.service.ts';
import { HEALTH_USE_CASE, PING_USE_CASE } from '../../context/health/application/ports/in/health.use-case.ts';

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: HEALTH_USE_CASE,
      useFactory: () => {
        return makeHealthService();
      },
    },
    {
      provide: PING_USE_CASE,
      useFactory: () => {
        return makePingService();
      },
    },
  ],
})
export class HealthModule {}
