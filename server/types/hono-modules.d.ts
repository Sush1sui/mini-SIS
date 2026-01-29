// Minimal module declarations to satisfy TypeScript for Hono helper packages.
declare module "hono/json" {
  export function json(
    body: any,
    status?: number,
    init?: Record<string, string | number | boolean>,
  ): Response;
}

declare module "hono/cookie" {
  import type { Context } from "hono";
  export function setCookie(
    c: Context,
    name: string,
    value: string,
    opts?: any,
  ): void;
  export function getCookie(c: Context, name: string): string | null;
}
