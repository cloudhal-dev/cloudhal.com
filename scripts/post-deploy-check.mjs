// After `cloudhal deploy` in Workers Builds: the site and Studio must answer. If either does not
// within ~2 minutes, both Workers are rolled back to their previous version and the build fails,
// so a bad release never stays live on cloudhal.com.
import { execFileSync } from "node:child_process";

const CHECKS = [
  { name: "site", url: "https://cloudhal.com/", worker: "cloudhal-com-site" },
  { name: "studio", url: "https://cloudhal-com-admin.yemek.workers.dev/api/health", worker: "cloudhal-com-admin" },
];

async function healthy(url) {
  for (let i = 0; i < 12; i++) {
    try {
      const res = await fetch(url, { redirect: "manual", headers: { "cache-control": "no-cache" } });
      if (res.status === 200) return true;
      console.log(`${url} answered ${res.status}, retrying`);
    } catch (e) {
      console.log(`${url} failed (${e.message}), retrying`);
    }
    await new Promise((r) => setTimeout(r, 10_000));
  }
  return false;
}

const failed = [];
for (const c of CHECKS) if (!(await healthy(c.url))) failed.push(c);
if (failed.length === 0) {
  console.log("post-deploy check: site and Studio answer 200");
  process.exit(0);
}
console.error(`post-deploy check failed: ${failed.map((c) => c.name).join(", ")}; rolling back`);
for (const c of CHECKS) {
  try {
    execFileSync("npx", ["wrangler", "rollback", "--name", c.worker, "--message", "post-deploy check failed", "-y"], { stdio: "inherit" });
  } catch (e) {
    console.error(`rollback of ${c.worker} failed: ${e.message}`);
  }
}
process.exit(1);
