import { drizzle } from "drizzle-orm/d1";
import type { Bindings } from "../env";

export function createDb(env: Bindings) {
  return drizzle(env.DB);
}
