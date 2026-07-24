import express from "express";
import type { Server } from "node:http";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = "0.0.0.0";
const STATIC_ASSET_PATTERN = /\.(?:js|css|svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|map)$/i;

function parsePort(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
}

function getServerConfig() {
  return {
    host: process.env.HOST || DEFAULT_HOST,
    port: parsePort(process.env.PORT),
    isProduction: process.env.NODE_ENV === "production",
  };
}

function applyBaseMiddleware(app: express.Express) {
  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  app.use((_, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
}

function registerHealthCheck(app: express.Express, isProduction: boolean) {
  app.get("/healthz", (_req, res) => {
    res.status(200).json({
      status: "ok",
      environment: isProduction ? "production" : "development",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });
}

async function configureDevelopmentServer(app: express.Express) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);
  return vite;
}

function configureProductionServer(app: express.Express) {
  const distPath = path.join(__dirname, "dist");

  app.use(
    express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-store");
          return;
        }

        if (STATIC_ASSET_PATTERN.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

function registerErrorHandler(app: express.Express) {
  app.use(
    (
      error: unknown,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
        error
      );

      if (res.headersSent) {
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  );
}

function registerGracefulShutdown(server: Server, vite?: ViteDevServer) {
  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      if (vite) {
        await vite.close();
      }

      process.exit(0);
    });

    setTimeout(() => {
      console.error("Force-closing server after shutdown timeout.");
      process.exit(1);
    }, 10000).unref();
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

async function startServer() {
  const app = express();
  const config = getServerConfig();

  applyBaseMiddleware(app);
  registerHealthCheck(app, config.isProduction);

  let vite: ViteDevServer | undefined;

  if (config.isProduction) {
    configureProductionServer(app);
  } else {
    vite = await configureDevelopmentServer(app);
  }

  registerErrorHandler(app);

  const server = app.listen(config.port, config.host, () => {
    console.log(
      `Server running on http://localhost:${config.port} (${config.isProduction ? "production" : "development"})`
    );
  });

  registerGracefulShutdown(server, vite);
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
