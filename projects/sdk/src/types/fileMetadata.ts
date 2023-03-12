import { FileType } from "./fileTypes";

export interface FileMetadata {
  filename: FilenameAttributes;
  shaHash: string;
  type: FileType;
}

export interface FilenameAttributes {
  /**
   * @minimum 0
   */
  layer: number;
  frame: {
    start: number;
    end: number;
  };
  misc?: string;
  extension: string;
  fullName: string;
}
