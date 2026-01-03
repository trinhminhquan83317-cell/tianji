export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
    }
    const response = await env.ASSETS.fetch(request);
    return response.status !== 404 ? response : new Response("Not Found", { status: 404 });
  },
};