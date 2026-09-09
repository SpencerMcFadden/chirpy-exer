import express, { Express } from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerValidate } from "./api/chirps.js";

const app: Express = express();
const port = 8080;

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerValidate);

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
