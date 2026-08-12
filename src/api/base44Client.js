import { createClient } from "@base44/sdk";

const appId = import.meta.env.VITE_BASE44_APP_ID || "6a638a13440242a5541c4e23";

export const base44 = createClient({ appId });
export const isDemoMode = import.meta.env.VITE_DEMO_MODE !== "false";

