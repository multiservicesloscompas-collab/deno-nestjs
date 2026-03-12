import { Module } from '@nestjs/common';
import { HolaController } from './hola.controller.ts';
import { makeSayHolaService } from '../../context/hola/application/services/say-hola.service.ts';
import { SAY_HOLA_USE_CASE } from '../../context/hola/application/ports/in/say-hola.use-case.ts';

@Module({
  controllers: [HolaController],
  providers: [
    {
      provide: SAY_HOLA_USE_CASE,
      useFactory: () => {
        return makeSayHolaService();
      },
    },
  ],
})
export class HolaModule {}
