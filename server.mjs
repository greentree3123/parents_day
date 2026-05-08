import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const rootPath = resolve(root);
const port = Number(process.env.PORT || 5173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const requested = cleanPath === "/" ? "/index.html" : cleanPath;
  const absolute = resolve(rootPath, `.${normalize(requested)}`);
  return absolute.startsWith(rootPath) ? absolute : join(rootPath, "index.html");
}

const server = http.createServer((request, response) => {
  const filePath = resolvePath(request.url || "/");
  const target = existsSync(filePath) && statSync(filePath).isFile() ? filePath : join(rootPath, "index.html");
  response.writeHead(200, { "Content-Type": types[extname(target)] || "application/octet-stream" });
  createReadStream(target).pipe(response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Parents Day site running at http://localhost:${port}`);
});
