import express, { Express } from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";

const app: Express = express();
const port = 8080;

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);

app.get("/admin/metrics", handlerMetrics);
app.get("/admin/reset", handlerReset);

app.use(middlewareLogResponses);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
