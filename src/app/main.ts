import "../config/env.ts";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.ts";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  });

  await app.listen(3000);
  const appUrl = await app.getUrl();
  const { host } = new URL(appUrl);
  console.log(`Application is running on host: ${host}`);
}
bootstrap();
