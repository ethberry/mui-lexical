// Every package that holds shared state must take it as a peer, never as a dependency of its own: two installed
// copies mean two React contexts / two Nest DI tokens, and the app silently reads the empty one (mui-dialog 6.0.0
// pinned @ethberry/provider-license and crashed every admin-ui CRUD page on 2026-11-13).
//
// Run from a repository root: node <path>/check-peers.mjs .        (exit 1 and a list when something is pinned)
//                            node <path>/check-peers.mjs . --fix   (move the offenders: peer range + exact devDependency)
//
// A package is "shared state" when it owns a React context, a Nest DI token, a router, a store or a module-level
// singleton. Add to SHARED only such packages; a factory (for example @emotion/cache) is not one.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Reviewed with Packages on 2026-11-13. Out on purpose, because two copies share nothing: viem and ioredis (pure
// functions and types; the app creates the clients), @ethberry/license-constants and -messages (plain data),
// @emotion/cache (a factory).
const SHARED = [
  // react and the libraries whose providers live at the app root
  "react",
  "react-dom",
  "react-router",
  "react-intl",
  "react-hook-form",
  "react-redux",
  "@reduxjs/toolkit",
  "@tanstack/react-query",
  "@emotion/react",
  "@emotion/styled",
  "@mui/material",
  "@mui/system",
  "@mui/x-date-pickers",
  "@mui/x-date-pickers-pro",
  "notistack",
  "lexical",
  "@lexical/react",
  "wagmi",
  "firebase",
  "@supabase/supabase-js",
  // Nest keeps its DI container, its decorators and its metadata in these
  "@nestjs/common",
  "@nestjs/core",
  "@nestjs/axios",
  "@nestjs/config",
  "@nestjs/typeorm",
  "@nestjs/swagger",
  "@nestjs/passport",
  "@nestjs/microservices",
  "@nestjs/throttler",
  "@nestjs/schedule",
  // a global metadata registry: with two copies one side's decorators are invisible to the other's pipes
  "class-validator",
  "class-transformer",
  "reflect-metadata",
  "typeorm",
  "rxjs",
];

// our own packages that export a provider / context / Nest module
const SHARED_ETHBERRY = /^@ethberry\/(provider-|nest-js-module-|mui-form$|mui-inputs-file$|redux$|history$)/;

const isShared = name => SHARED.includes(name) || SHARED_ETHBERRY.test(name);

const root = process.argv[2] ?? ".";
const fix = process.argv.includes("--fix");

const manifests = [];
const walk = dir => {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (entry === "package.json") {
      manifests.push(path);
    }
  }
};
walk(root);

const problems = [];
for (const path of manifests) {
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  if (pkg.private) continue;
  const deps = pkg.dependencies ?? {};
  for (const [name, range] of Object.entries(deps)) {
    if (!isShared(name)) continue;
    problems.push({ path, name, range, peer: pkg.peerDependencies?.[name] });
    if (fix) {
      // 0.x: every minor may break, so the range is the current minor
      const [major, minor] = /(\d+)\.(\d+)/.exec(range)?.slice(1) ?? [];
      const guess = major === "0" ? `^0.${minor}.0` : `^${major}.0.0`;
      pkg.peerDependencies = { ...(pkg.peerDependencies ?? {}), [name]: pkg.peerDependencies?.[name] ?? guess };
      pkg.devDependencies = { ...(pkg.devDependencies ?? {}), [name]: range };
      delete pkg.dependencies[name];
      writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
    }
  }
}

// lerna bumps the exact devDependency of a local package but never a peer range, so a package can keep a peer major
// older than the one it needs: mui-inputs-file peered mui-form ^16 while importing useInputPending, which exists from
// 17, and installed next to mui-form 16 that call is undefined at run time.
const local = new Map();
for (const path of manifests) {
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  if (pkg.name && pkg.version) {
    local.set(pkg.name, pkg.version);
  }
}

const stale = [];
for (const path of manifests) {
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  for (const [name, range] of Object.entries(pkg.peerDependencies ?? {})) {
    const version = local.get(name);
    if (!version) {
      continue;
    }
    const major = Number(version.split(".")[0]);
    const allowed = range.split("||").map(part => Number((/\d+/.exec(part) ?? ["-1"])[0]));
    // a range ahead of the version field is this release's new major, which lerna has not written yet; only a range
    // that stops below the repository's own version is stale
    if (Math.max(...allowed) < major) {
      stale.push(`${path}: peer ${name} ${range} is older than the ${name} of this repository (${version})`);
    }
  }
}

if (stale.length) {
  for (const line of stale) {
    console.error(line);
  }
  console.error(
    `\n${stale.length} stale peer ${stale.length === 1 ? "range" : "ranges"} on a package of this repository: lerna never updates a peer range, so widen or raise it by hand in the PR that needs it.`,
  );
  process.exitCode = 1;
}

if (!problems.length) {
  console.info(`${manifests.length} packages: no shared-state package is pinned as a dependency`);
} else {
  for (const { path, name, range, peer } of problems) {
    console.error(`${path}: ${name} ${range} is a dependency${peer ? ` (and a peer ${peer})` : ""}`);
  }
  console.error(
    `\n${problems.length} pinned shared-state ${problems.length === 1 ? "package" : "packages"}. Each must be a peerDependency with a range plus an exact devDependency.` +
      (fix
        ? " Fixed: review the diff, the peer ranges are guesses."
        : " Re-run with --fix to move them, then review the diff."),
  );
  process.exitCode = 1;
}
