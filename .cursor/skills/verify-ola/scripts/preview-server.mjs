// Verification-only Astro preview. Port comes from argv so this never binds 4321.
import { preview } from "astro";

const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  process.stderr.write("preview-server: invalid port\n");
  process.exit(1);
}

const server = await preview({ server: { host: "127.0.0.1", port } });
process.stdout.write(`ready ${port}\n`);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await server.stop();
    process.exit(0);
  });
}
