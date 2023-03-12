import { FileMetadata } from "./fileMetadata";
import { SceneManifest } from "./sceneManifest";

export interface SceneMetadata extends SceneManifest {
  files: FileMetadata[];
}
