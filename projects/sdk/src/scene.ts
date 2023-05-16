import { map, max, prop, range, reduce } from "ramda";
import * as sharp from "sharp";
import { Image } from "types";
import { constants } from "./constants";
import { anonLog } from "./util";

export type FrameOptions = {
  height: number;
  width: number;
  frameRate: number;
};

const defaultFrameOptions: FrameOptions = {
  height: constants.canvas.height,
  width: constants.canvas.width,
  frameRate: constants.frameRate,
};

export const buildEmptyFrames = (
  count: number,
  options: FrameOptions = defaultFrameOptions
) =>
  range(0, count).map((_, frame) => ({
    frame,
    sharp: sharp({
      create: {
        height: options.height,
        width: options.width,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    }),
  }));

export const highestFrameNumber = reduce<Image, number>(
  (highest, image) => max(highest, image.filename.frame.end),
  0
);

export const buildFrameMap = reduce<Image, Map<number, Image[]>>(
  (acc, image) => {
    const { start, end } = image.filename.frame;
    anonLog(
      `Adding ${image.filename.fullName} to frameMap with range ${start}, ${end}`
    );
    for (let frameId of range(start, end + 1)) {
      anonLog(`Adding ${frameId} (${image.filename.fullName}) to frameMap`);
      if (acc[frameId] === undefined) acc[frameId] = [];
      acc[frameId].push(image);
    }
    return acc;
  },
  new Map<number, Image[]>()
);

export type SceneOptions = {
  frameOptions: FrameOptions;
  layerGravity: sharp.Gravity;
};

const defaultSceneOptions: SceneOptions = {
  frameOptions: defaultFrameOptions,
  layerGravity: "northwest",
};

export const buildScene = async (
  images: Image[],
  options: Partial<SceneOptions> = {}
) => {
  options = { ...defaultSceneOptions, ...options };
  anonLog(`Building scene for ${images.length} image(s)`);
  // Build empty frames
  const emptyFrameLength = highestFrameNumber(images) + 1;
  anonLog(`Attempting to build empty frames for ${emptyFrameLength} frame(s)`);
  let frames = buildEmptyFrames(emptyFrameLength, options.frameOptions);
  anonLog(`Built empty frames, building frame map`);
  const frameMap = buildFrameMap(images);
  // Add images to frames
  frames = await Promise.all(
    frames.map(async (frame, frameId) => {
      anonLog(`Adding images for frame ${frameId}`);
      const composites = (
        await Promise.all(
          map(async (image: Image) => {
            anonLog(`Generating sharp buffer for ${image.filename.fullName}`);
            const sharpBuffer = await image.sharp.toBuffer();
            anonLog(
              `Adding image ${image.filename.fullName} to frame ${frameId} as layer ${image.filename.layer}`
            );
            return {
              layer: image.filename.layer,
              composite: {
                input: sharpBuffer,
                gravity: options.layerGravity,
              },
            };
          }, frameMap[frameId])
        )
      )
        .sort((a, b) => a.layer - b.layer)
        .map(prop("composite"));
      return {
        ...frames[frameId],
        sharp: frames[frameId].sharp.composite(composites),
      };
    })
  );
  return frames;
};
