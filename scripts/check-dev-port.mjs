import net from "node:net";

const port = 3000;
const host = "127.0.0.1";

const server = net.createServer();

server.once("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error("npm run dev will not switch ports automatically.");
    console.error("Identify the listener with: ./scripts/dev-ports.sh check");
    console.error(`Stop only that listener after confirmation with: ./scripts/dev-ports.sh stop ${port}`);
  } else {
    console.error(`Could not check port ${port}: ${error.message}`);
  }
  process.exitCode = 1;
});

server.once("listening", () => {
  server.close();
});

server.listen({ host, port, exclusive: true });
