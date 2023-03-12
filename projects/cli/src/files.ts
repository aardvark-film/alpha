import { calculateMetadata, extractFileNameFromPath, Image } from "frames-sdk";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { filter } from "ramda";
import * as sharp from "sharp";

export const getAllFiles = (dir: string, children: string[] = []) => {
  let files = readdirSync(dir);

  for (let file of files) {
    if (statSync(dir + "/" + file).isDirectory()) {
      children = getAllFiles(dir + "/" + file, children);
    } else {
      children.push(join(dir, "/", file));
    }
  }

  return children;
};

export const loadFile = async (path: string): Promise<Image | undefined> => {
  try {
    const fileSharp = sharp(path);
    const metadata = calculateMetadata(
      extractFileNameFromPath(path),
      await fileSharp.toBuffer()
    );
    return {
      sharp: fileSharp,
      ...metadata,
    };
  } catch (e) {
    console.error(`File ${path} could not be loaded`);
    console.error(e);
    return undefined;
  }
};

export const validFileFilter = filter(
  (path: string) => path.match(/^.*\.(png|jpg|jpeg|gif|tiff)/) !== null
);
