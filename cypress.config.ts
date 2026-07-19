import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    allowCypressEnv: false,
    video: false,
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
    },
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
});
