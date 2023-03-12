import { FilenameAttributes } from "frames-sdk";
import {
  extractAttributesFromFilename,
  extractFileNameFromPath,
  calculateMetadata,
} from "./image";
import { readFileSync } from "fs";

test("extract file name from path", () => {
  expect(extractFileNameFromPath("bar.png")).toBe("bar.png");
  expect(extractFileNameFromPath("foo/bar.png")).toBe("bar.png");
  expect(extractFileNameFromPath("/foo/bar.png")).toBe("bar.png");
  expect(extractFileNameFromPath("/path/to/foo/bar.png")).toBe("bar.png");
  expect(extractFileNameFromPath("/path/to/foo/bar.pip.pop.png")).toBe(
    "bar.pip.pop.png"
  );
});

test("extract metadata from filename", () => {
  const tests: FilenameAttributes[] = [
    {
      fullName: "0_1.png",
      misc: undefined,
      frame: {
        start: 1,
        end: 1,
      },
      layer: 0,
      extension: "png",
    },
    {
      fullName: "1000_1.png",
      misc: undefined,
      frame: {
        start: 1,
        end: 1,
      },
      layer: 1000,
      extension: "png",
    },
    {
      fullName: "0_1-100.png",
      misc: undefined,
      frame: {
        start: 1,
        end: 100,
      },
      layer: 0,
      extension: "png",
    },
    {
      fullName: "0_1-100.final-final copyof last.png",
      misc: "final-final copyof last",
      frame: {
        start: 1,
        end: 100,
      },
      layer: 0,
      extension: "png",
    },
    {
      fullName: "bg_0-100.svg",
      misc: undefined,
      frame: {
        start: 0,
        end: 100,
      },
      layer: 0,
      extension: "svg",
    },
  ];
  expect(extractAttributesFromFilename("ispotato.png")).toBe(undefined);
  for (let test of tests) {
    expect(extractAttributesFromFilename(test.fullName)).toStrictEqual(test);
  }
});

test("file parsing", () => {
  const gnomeContents = readFileSync("./testdata/0.png");
  expect(calculateMetadata("./testdata/0_1.png", gnomeContents)).toStrictEqual({
    filename: {
      extension: "png",
      frame: {
        end: 1,
        start: 1,
      },
      fullName: "0_1.png",
      layer: 0,
      misc: undefined,
    },
    shaHash: "b6fb230fe6b3eb6e849f727ed0d36e59fa0874ca92d8735d9f9b03ccda985cb1",
    type: "background",
  });
  expect(calculateMetadata("./testdata/1_1.png", gnomeContents)).toStrictEqual({
    filename: {
      extension: "png",
      frame: {
        end: 1,
        start: 1,
      },
      fullName: "1_1.png",
      layer: 1,
      misc: undefined,
    },
    shaHash: "b6fb230fe6b3eb6e849f727ed0d36e59fa0874ca92d8735d9f9b03ccda985cb1",
    type: "foreground",
  });
});
