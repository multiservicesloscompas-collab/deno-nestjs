import { Module } from '@nestjs/common';
import { HolaModule } from './hola/hola.module.ts';
import { WhatsAppModule } from './whatsapp/whatsapp.module.ts';

@Module({
  imports: [HolaModule, WhatsAppModule],
})
export class AppModule {}
