import {
  anonLog,
  buildScene,
  FrameOptions,
  Image,
  printDangerWarning,
} from "frames-sdk";
import { existsSync, mkdirSync, readdirSync } from "fs";
import * as path from "path";
import { pipe } from "ramda";
import { loadFile, validFileFilter } from "./files";
import * as shell from "any-shell-escape";
import * as pathToFfmpeg from "ffmpeg-static";
import { resolve } from "path";
import { exec } from "child_process";
printDangerWarning();

const frameOptions: FrameOptions = {
  height: 108,
  width: 192,
  frameRate: 30,
};

const sceneArg = process.argv[2];

if (!sceneArg) {
  anonLog("usage: yarn start my-scene-name");
  process.exit(1);
}

const absoluteSceneDir = [
  // Not the best but it works for now, needs updated if project structure changes
  __dirname.replace(/projects(\\|\/)cli(\\|\/)(src|build)/, ""),
  "media",
  "scenes",
  sceneArg,
].join(path.sep);

const outBase = process.env.OUTPUT_DIR || resolve(process.cwd(), "output");

const sceneName = absoluteSceneDir.replace(/^.*\/(.*)/, "$1");

const run = async () => {
  // Check if scenedir exists
  if (!existsSync(absoluteSceneDir)) {
    anonLog(
      `The scene ${sceneArg} does not exist, please check spelling and that scene exists`,
      `Looked in ${absoluteSceneDir}`
    );
    process.exit(2);
  }

  const images: Image[] = [];
  for (let file of pipe(validFileFilter)(readdirSync(absoluteSceneDir))) {
    const absoluteFilePath = [absoluteSceneDir, file].join(path.sep);
    anonLog(`Loading file ${absoluteFilePath}`);
    const image = await loadFile(absoluteFilePath);
    images.push(image);
    anonLog(`Loaded ${file}`);
  }
  const scene = await buildScene(images, {
    frameOptions,
  });

  if (!existsSync(outBase)) {
    anonLog("Creating output directory for media files", `Creating ${outBase}`);
    mkdirSync(outBase);
  }
  const sceneOutputDir = [outBase, sceneName].join(path.sep);

  if (!existsSync(sceneOutputDir)) {
    anonLog(
      `Creating output file directory for scene ${sceneName}`,
      `Creating ${sceneOutputDir}`
    );
    mkdirSync(sceneOutputDir);
  }

  const sceneOutputFramesDir = [sceneOutputDir, "frames"].join(path.sep);

  if (!existsSync(sceneOutputFramesDir)) {
    anonLog(
      `Creating output file directory for scene ${sceneName} frames`,
      `Creating ${sceneOutputFramesDir}`
    );
    mkdirSync(sceneOutputFramesDir);
  }

  for (const frame of scene) {
    await frame.sharp.toFile(
      [sceneOutputFramesDir, `frame_${frame.frame}.png`].join(path.sep)
    );
  }

  // build video file
  anonLog(`Building video file for scene ${sceneName}`);
  const makeSceneVideo = shell([
    pathToFfmpeg,
    "-y",
    "-s",
    `${frameOptions.width}x${frameOptions.height}`,
    "-r",
    frameOptions.frameRate,
    "-i",
    [sceneOutputFramesDir, "frame_%d.png"].join(path.sep),
    "-c:v",
    "libx264",
    "-qp",
    "0",
    "-preset",
    "veryslow",
    [sceneOutputDir, `${sceneName}.mp4`].join(path.sep),
    [sceneOutputDir, `${sceneName}.mkv`].join(path.sep),
  ]);
  await new Promise((resolve, reject) => {
    exec(makeSceneVideo, (err, stdout, stderr) => {
      if (err) {
        anonLog("Error converting files to video file", stderr);
        reject(err);
        return;
      }
      anonLog(`Completed converting ${sceneArg} to video`, stdout);
      resolve(undefined);
    });
  });
};

run();
