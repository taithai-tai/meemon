import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

function env() {
  return {
    ASSETS: {
      fetch: async (request) => new Response(`asset:${new URL(request.url).pathname}`, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    },
  };
}

const ctx = { waitUntil() {}, passThroughOnException() {} };

test("server-renders the Meemon Home", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), env(), ctx);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /MEEMON UNIVERSE/);
  assert.match(html, /ทุกความเชื่อ/);
  assert.match(html, /สินค้าจริง/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders a v2 module", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/v2/fortune", { headers: { accept: "text/html" } }), env(), ctx);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /FORTUNE STUDIO/);
  assert.match(html, /ไพ่ทาโรต์/);
});

test("legacy URL is served as an asset without a redirect", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/app/index.html"), env(), ctx);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "asset:/app/index.html");
});
