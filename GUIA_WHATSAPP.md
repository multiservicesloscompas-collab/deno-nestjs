# Guía Paso a Paso: Integración de WhatsApp con Meta API

Esta guía detalla cómo configurar y utilizar la nueva funcionalidad de mensajería de WhatsApp en esta aplicación NestJS + Deno.

## 1. Configuración Inicial en Meta for Developers

Antes de probar el código, necesitas una cuenta activa en Meta:
1.  **Crea una Aplicación**: Ve a [Meta for Developers](https://developers.facebook.com/) y crea una app de tipo "Business".
2.  **Agrega WhatsApp**: En el dashboard, haz clic en "Set up" para el producto de WhatsApp.
3.  **Configura el Número**: Meta te proporcionará un número de prueba. Toma nota del `Phone Number ID`.
4.  **Genera un Token**: Genera un `Temporary Access Token` (o uno permanente si ya tienes el Business Manager configurado).

## 2. Variables de Entorno (.env)

Debes configurar un archivo `.env` en la raíz del proyecto basándote en `.env.example`. **Toda la configuración confidencial debe residir aquí**.

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `WHATSAPP_ACCESS_TOKEN` | El token de acceso proporcionado por Meta. | `EAAB...` |
| `WHATSAPP_PHONE_NUMBER_ID` | El ID del número que enviará los mensajes. | `123456789...` |
| `WHATSAPP_VERIFY_TOKEN` | Un string secreto que tú elijas para el webhook. | `mi_token_secreto_123` |

## 3. Uso de la Aplicación

### A. Verificación del Webhook
Meta requiere verificar tu URL. Cuando configures el Webhook en el portal de Meta, usa:
- **Callback URL**: `https://tu-dominio.com/whatsapp/webhook`
- **Verify Token**: El mismo que pusiste en `WHATSAPP_VERIFY_TOKEN`.

### B. Escuchar Mensajes (Endpoint de Escucha)
Una vez verificado, Meta enviará notificaciones a:
- **Endpoint**: `POST /whatsapp/webhook`
- **Lógica**: El sistema procesa el JSON de Meta, extrae el contenido del mensaje y el remitente, y lo registra en el repositorio (actualmente logueado en consola).

### C. Responder / Enviar Mensajes (Endpoint de Respuesta)
Para enviar un mensaje de forma manual desde tu aplicación:
- **Endpoint**: `POST /whatsapp/send`
- **Cuerpo (JSON)**:
  ```json
  {
    "to": "5215512345678",
    "message": "Hola, esto es una respuesta desde la app"
  }
  ```
- **Pruebas**: Puedes usar el archivo [request/whatsapp.http](file:///Users/kembertnieves/Documents/Saikilito/deno-nestjs/request/whatsapp.http) para probar estos endpoints localmente.

## 4. Detalles de Arquitectura

- **Contexto (`src/context/whatsapp`)**: Contiene la lógica pura con tipado estricto e inyección de dependencias funcional.
- **TDD**: La aplicación sigue principios de TDD para asegurar la robustez de la lógica de negocio.
