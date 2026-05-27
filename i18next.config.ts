import { defineConfig } from "i18next-cli";

export default defineConfig({
  locales: ["en", "ru", "uk"],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "public/locales/{{language}}/{{namespace}}.json",
  },
  locize: {
    projectId: "fb6b9722-71fa-4fda-84e5-27dbc06a23d5",
    apiKey: process.env.LOCIZE_API_KEY,
  },
});
