import { defineConfig } from "vite";

// Define the base public path so built assets use the repository name
// This ensures the site works when served from https://<user>.github.io/<repo>/
export default defineConfig({
    base: "/timer-cuber/",
});
