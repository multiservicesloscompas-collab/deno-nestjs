import { Controller, Get, Inject } from '@nestjs/common';
import { SAY_HOLA_USE_CASE } from '../../context/hola/application/ports/in/say-hola.use-case.ts';
import type { SayHolaUseCase } from '../../context/hola/application/ports/in/say-hola.use-case.ts';

@Controller()
export class HolaController {
  constructor(
    @Inject(SAY_HOLA_USE_CASE)
    private readonly sayHolaUseCase: SayHolaUseCase,
  ) {}

  @Get()
  getHola(): string {
    return this.sayHolaUseCase().message;
  }
}
