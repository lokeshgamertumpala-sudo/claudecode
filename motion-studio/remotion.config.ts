import { Config } from "@remotion/cli/config";

// Turbocharged Remotion 60FPS Hardware-Accelerated Configuration
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(12);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCachingEnabled(true);
Config.setX264Preset("veryfast");
Config.setChromiumHeadlessMode(true);
