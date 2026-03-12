import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.ts';
import { WhatsAppModule } from './whatsapp/whatsapp.module.ts';

@Module({
  imports: [HealthModule, WhatsAppModule],
})
export class AppModule {}
