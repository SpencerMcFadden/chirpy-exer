import express, { Express, Request, Response } from "express";

const app: Express = express();
const port = 8080;
const handlerReadiness = (req: Request, res: Response) => {
  res.set({
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.send("OK");
};

app.get("/healthz", handlerReadiness);
app.use("/app", express.static("./src/app"));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
