import { Greeting } from '../../../domain/models/greeting.model.ts';

export const SAY_HOLA_USE_CASE = 'SAY_HOLA_USE_CASE';

export type SayHolaUseCase = () => Greeting;
