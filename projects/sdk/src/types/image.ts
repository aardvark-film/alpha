import { Sharp } from "sharp";
import { FileMetadata } from "./fileMetadata";

export interface Image extends FileMetadata {
  sharp: Sharp;
}
