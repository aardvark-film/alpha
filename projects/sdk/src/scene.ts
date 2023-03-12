import { map, max, prop, range, reduce } from "ramda";
import * as sharp from "sharp";
import { Image } from "types";
import { constants } from "./constants";

export type FrameOptions = {
  height: number;
  width: number;
};

const defaultFrameOptions: FrameOptions = {
  height: constants.canvas.height,
  width: constants.canvas.width,
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
    for (let frameId of range(start, end + 1)) {
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
  // Build empty frames
  let frames = buildEmptyFrames(
    highestFrameNumber(images) + 1,
    options.frameOptions
  );
  const frameMap = buildFrameMap(images);
  // Add images to frames
  frames = await Promise.all(
    frames.map(async (frame, frameId) => {
      const composites = (
        await Promise.all(
          map(
            async (image: Image) => ({
              layer: image.filename.layer,
              composite: {
                input: await image.sharp.toBuffer(),
                gravity: options.layerGravity,
              },
            }),
            frameMap[frameId]
          )
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
