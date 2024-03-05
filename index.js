const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const routes = require("./src/routes/index");
const WebSockets = require("./src/socket/WebSocket");

const { errorLogger, accessLogger } = require("./src/docs/morganConfig");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 1000;
require("./src/db/conn");
require("./src/seeders/index")();
const { badRequest } = require("./src/utils/messages");

app.use(errorLogger);
app.use(accessLogger);

const corsOptions = { origin: process.env.ALLOW_ORIGIN };
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(require("./src/utils/responseHandler"));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return badRequest({ message: "Invalid Json Formate...!" }, res);
  }
  return next();
});
app.use(routes);

const { ENV } = process.env;
if (ENV === "DEV") {
  app.use(
    "/api-docs",
    mobileSwaggerUI.serve,
    mobileSwaggerUI.setup(swaggerDocs)
  );
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocs);
  });
}

app.use("/", express.static(path.join(__dirname, "")));

const server = http.createServer(app);

global.io = socketIO(server);
global.io.on("connection", (client) => {
  WebSockets.connection(client);
});

server.listen(PORT, () => {
  console.log(`Server Running At Port : ${PORT}`);
});
