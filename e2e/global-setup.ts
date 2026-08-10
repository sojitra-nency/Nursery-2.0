import { locales } from "../lib/i18n/config";

/**
 * Warm every route before the suite starts.
 *
 * The suite runs against `next dev`, which compiles a route the first time it is
 * requested. With 13 locales and parallel workers, several tests would each trigger
 * a cold compile at once and the slowest could outlast the assertion timeout — a
 * navigation that *did* succeed reading as a failure, and only intermittently.
 *
 * Requesting each route once up front removes the race at its source, rather than
 * papering over it with a longer timeout.
 */
export default async function globalSetup() {
  const port = process.env.E2E_PORT ?? "3000";
  const baseUrl = `http://localhost:${port}`;

  const paths = ["/", ...locales.flatMap((l) => [`/${l}`, `/${l}/catalog`])];

  await Promise.all(
    paths.map((path) =>
      fetch(`${baseUrl}${path}`).catch(() => {
        // A route that fails to warm isn't fatal — the test that needs it will
        // compile it on demand and simply take longer.
      })
    )
  );
}
