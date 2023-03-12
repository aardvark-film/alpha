import { FileMetadata, FilenameAttributes } from "types/fileMetadata";
import * as crypto from "crypto";
import { FileType } from "types/fileTypes";
import { Image } from "types";
import { max } from "ramda";

export type Scene = {
  name: string;
};

export const layerNumberToFileType = (layer: number): FileType =>
  layer === 0 ? "background" : "foreground";

export const extractFileNameFromPath = (path: string) =>
  path.replace(/^.*\/(.*)/, "$1");

export const extractAttributesFromFilename = (
  filename: string
): FilenameAttributes | undefined => {
  // Extract filename, in case someone gives us a path
  filename = extractFileNameFromPath(filename);
  const match = filename.match(
    /^(?<layer>bg|\d+)_(?<startframe>\d+)(-(?<endframe>\d+))?(\.(?<misc>.*))?\.(?<extension>[^\.]+)/
  );
  return match
    ? {
        fullName: filename,
        layer: match.groups.layer === "bg" ? 0 : Number(match.groups.layer),
        frame: {
          start: Number(match.groups.startframe),
          end: match.groups.endframe
            ? Number(match.groups.endframe)
            : Number(match.groups.startframe),
        },
        misc: match.groups.misc,
        extension: match.groups.extension,
      }
    : undefined;
};

export const calculateMetadata = (
  filename: string,
  fileContents: Buffer
): FileMetadata => {
  const filenameMetadata = extractAttributesFromFilename(filename);
  const shaHash = crypto
    .createHash("sha256")
    .update(fileContents)
    .digest("hex");
  return {
    filename: filenameMetadata,
    shaHash,
    type: layerNumberToFileType(filenameMetadata.layer),
  };
};

export const imageLayerCompare = (a: Image, b: Image) =>
  a.filename.layer - b.filename.layer;
