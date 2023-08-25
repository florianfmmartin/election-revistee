import { serveDir, serveFile } from "https://deno.land/std@0.194.0/http/file_server.ts";

Deno.serve((req: Request) => {
  const pathname = new URL(req.url).pathname;

  if (pathname === "/") {
    return serveFile(req, "./index.html");
  }

  if (pathname.startsWith("/public")) {
    return serveDir(req, {
      fsRoot: "public",
      urlRoot: "public",
    });
  }

  return new Response("404: Not Found", {
    status: 404,
  });
});