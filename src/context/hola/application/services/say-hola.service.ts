import type { SayHolaUseCase } from '../ports/in/say-hola.use-case.ts';

export const makeSayHolaService = (): SayHolaUseCase => () => {
  return { message: 'hola' };
};
