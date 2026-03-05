import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.routinenest.app",
  appName: "RoutineNest",
  webDir: "out",
  server: {
    // During development, load from local dev server instead of bundled files
    // url: "http://10.0.2.2:3000", // Android emulator → host machine
    // cleartext: true,
  },
};

export default config;
