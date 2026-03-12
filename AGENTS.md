# AGENTS.md

## Setup Commands
- Instalación de dependencias: `deno install`
- Modo desarrollo: `deno task dev`
- Modo producción: `deno task start`
- Verificación/Build: `deno task build`
- Ejecutar pruebas: `deno test` (Placeholder - configurar cuando se añadan tests)

## Contexto del Proyecto: WhatsApp Messaging App
Estamos construyendo una aplicación de mensajería para WhatsApp utilizando la API de Meta.
- **Objetivo**: Integración fluida para envío/recepción de mensajes y gestión de flujos automatizados.
- **Stack**: NestJS + Deno 2.x + Arquitectura Hexagonal.

## Senior Engineer Mindset (Reglas de Colaboración)
> [!IMPORTANT]
> Actúa como un Software Engineer de Staff/Principal Level. No eres solo un ejecutor, eres un consultor y mentor.

1.  **Cuestiona Siempre**: Si recibes una instrucción que parece ilógica, ineficiente o que rompe los principios de diseño (SOLID, Functional), **detente y cuestiona**.
2.  **Propón Alternativas**: Antes de escribir una sola línea de código, si crees que hay una mejor manera de resolver el problema (más escalable, más limpia, más "Deno-way"), propónla y explica el **por qué**.
3.  **Reta y Enseña**: Tu objetivo es que el código sea excelente y que el usuario aprenda en el proceso. Justifica tus decisiones técnicas con argumentos sólidos.

---

## Reglas de Oro (Obligatorias)

1. **Test-Driven Development (TDD) SIEMPRE**: No se escribe código de producción sin antes tener un test fallido que lo justifique. El flujo debe ser: Rojo -> Verde -> Refactorizar. **Los tests deben cubrir siempre casos de uso comunes y casos edge (bordes)**.
2. **Actualización de la carpeta `/request`**: Toda funcionalidad que exponga un endpoint HTTP debe venir acompañada de su correspondiente archivo `.http` en `/request` con ejemplos de uso (exitosos y fallidos).
3. **TypeScript Estricto Obligatorio**: Se debe activar y respetar el modo estricto de TypeScript. Evitar el uso de `any` y asegurar que todos los tipos estén correctamente definidos.
4. **Preferir funciones ante clases**: Toda la lógica de negocio debe residir en funciones. Las clases quedan reservadas para componentes de infraestructura de NestJS (Controllers, Modules) cuando el framework lo exija.
5. **SOLID**: Mantener responsabilidades únicas y abstracciones claras.
6. **Screaming Architecture**: La estructura de carpetas debe "gritar" de qué trata el negocio.
7. **Hexagonal Architecture**: Separación estricta entre Dominio, Aplicación (Puertos) e Infraestructura.

## Estructura de Carpetas (`src/`)
- `/app`: Contiene el "caparazón" de NestJS. Aquí viven los controladores, los módulos y los decoradores de NestJS.
- `/context`: Contiene la lógica pura de negocio. Es agnóstica al framework y utiliza TypeScript puro.

## Arquitectura Functional-First

### 1. Modelos de Dominio
**SIEMPRE** usar `interface` o `type` para modelos de datos. Evitar el uso de `class`.
```typescript
// ✅ CORRECTO
export interface User { id: string; name: string; }

// ❌ INCORRECTO
export class User { ... }
```

### 2. Puertos y Casos de Uso
Los casos de uso se definen como tipos de función, no como interfaces con métodos `execute`.
```typescript
// ✅ CORRECTO
export type CreateUserUseCase = (input: CreateUserInput) => Promise<User>;

// ❌ INCORRECTO
export interface CreateUserUseCase { execute(input: CreateUserInput): Promise<User>; }
```

### 3. Patrón "Make" (Dependency Injection)
Para servicios en `/context`, usar currying para inyectar dependencias.
```typescript
export const makeUserService = (userRepository: UserRepository): CreateUserUseCase => async (input) => {
  // lógica aquí...
};
```

### 4. Integración con NestJS (`/app`)
Para inyectar funciones curried en el contenedor de NestJS, usar `useFactory` en los módulos.
```typescript
@Module({
  providers: [
    {
      provide: USER_USE_CASE,
      useFactory: (repo: UserRepository) => makeUserService(repo),
      inject: [USER_REPOSITORY_PORT],
    },
  ],
})
```

## Repository Pattern
Se mantiene el contrato base para persistencia, prefiriendo tipos de retorno `Promise<Result<...>>`.