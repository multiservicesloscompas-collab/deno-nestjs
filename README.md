# Deno x NestJS - WhatsApp Messaging App (Meta API)

Este proyecto es una aplicación de mensajería para WhatsApp utilizando la API de Meta, construida como una arquitectura avanzada que integra **NestJS** sobre el runtime de **Deno 2.x**, aplicando principios de **Arquitectura Hexagonal**, **Screaming Architecture** y **Programación Funcional**.

## 🏗️ Estructura del Proyecto

El código se divide estrictamente en dos mundos para separar las preocupaciones:

```text
src/
├── app/                                      <-- CAPARAZÓN (Framework Core)
│   ├── main.ts                               <-- Bootstrap de Deno/NestJS
│   ├── app.module.ts                         <-- Raíz de configuración
│   └── [feature]/                            <-- Componentes específicos del framework
│       ├── [feature].controller.ts           <-- Adaptador Primario (HTTP)
│       └── [feature].module.ts               <-- Wiring (Inyección de dependencias)
│
└── context/                                  <-- LÓGICA PURA (Business Core)
    └── [feature]/                            (Screaming Architecture)
        ├── application/
        │   ├── ports/
        │   │   └── in/                       <-- Sello del Caso de Uso (Type signatures)
        │   └── services/                     <-- Lógica curried (Patrón Make)
        └── domain/
            └── models/                       <-- Modelos (Interfaces/Types)
```

## 🛠️ Tecnologías
- **Deno 2.x**: Runtime nativo con soporte de TypeScript.
- **NestJS**: Framework para la estructura de la aplicación y DI.
- **Functional-First**: Lógica de negocio basada en funciones y currying, evitando el estado compartido y las clases pesadas.

## 🚀 Inicio Rápido
- **Modo Desarrollo**: `deno task dev` (con auto-reload).
- **Modo Producción**: `deno task start`.
- **Verificación/Build**: `deno task build`.

## 🌐 Despliegue
Este proyecto utiliza **GitHub Actions** para el despliegue automático en **Deno Deploy**. Cada push a la rama `main` dispara el proceso de verificación (`deno task build`) y despliegue a producción.

## 📐 Patrones Aplicados
- **Patrón Make**: Las funciones de `/context` reciben sus dependencias por currying (`makeService(deps)(input)`).
- **Functional Ports**: Los puertos no son interfaces con métodos, sino firmas de tipos de funciones.
- **Plain Models**: Los modelos de dominio son `interface` puras, asegurando que los datos sean PURE DATA.

---

Desarrollado con ❤️ para un flujo de trabajo NestJS ultra limpio y eficiente en Deno.
