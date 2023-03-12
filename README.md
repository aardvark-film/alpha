# Project Aardvark

Frames is an experimental tool aimed at making a collaborative open source
film in a Nounish way.

## Quick Start

### Prerequisites

1. Have [Nodejs V18](https://nodejs.org) installed
2. Have `yarn` installed (`npm i -g yarn`)
3. Have GitHub desktop installed

### Get Project Aardvark

1. Navigate to https://github.com/aardvark-film/alpha
2. [Clone the repository using GitHub Desktop](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository?tool=desktop&platform=windows)

### Build Tools

From a command line in where you've checked out the repository:

1. Install dependencies with `yarn install`
2. Build all dependencies with `yarn build`

### Render Scene

Edit the artwork and frames within your `media/scenes/scene-name` directory. Then
from a terminal at the root of the repository:

1. Build your scene with `yarn build-scene <scene directory name>`
2. Review your media in `output/scene-name`

## Project Structure

### Media

The media directory has directory for each scene, each directory then includes
individual frames and layers. Frame images follow a convention of
`<layer>_<start frame>(-<end frame>).png`.

```
                 ┌─┬┬─┬┬─┬┬─┐     ┌─┬┬─┬┬─┬┬─┐
                 │F││F││F││F│     │F││F││F││F│
                 │R││R││R││R│     │R││R││R││R│
┌─┬┬─┬┬─┬┬─┐     │A││A││A││A│     │A││A││A││A│
│F││F││F││F│     │M││M││M││M│     │M││M││M││M│
│R││R││R││R│     │E││E││E││E│     │E││E││E││E│
│A││A││A││A│     │ ││ ││ ││ │     │ ││ ││ ││ │
│M││M││M││M│     │1││2││3││4│     │1││2││3││4│
│E││E││E││E│     ├─┼┼─┼┼─┼┼─┤     │ │┼─┼┼─┼┼─┤
│ ││ ││ ││ │     ├──────────┤     │ │┼───────┤
│1││2││3││4│     │Background│     │ ││Layer 0|
| || || || |     |FRAME 1-4 |     | ||FRM 2-4|
├─┼┼─┼┼─┼┼─┤     ├──────────┤     ├─┼┼───────┤
├──────────┤     ├──────────┤     ├──────────┤
│          │     │          │     │          │
│ Scene 1  ├────►│ Scene 2  ├────►│ Scene 3  │
│          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘
```

Layers work like Photoshop layers wherein images are stacked on top of each other
starting from 0 and moving up; layer 1 covers layer 0, `bg` is an alias for layer
0, etc.

Each image includes a definition for which frames the image should be present on.
An image must include at least a start frame number and optionally can include an
end frame definition. If only one frame is provided, the image will only be present
for that frame, if a range is provided, the image will be present on the frames
within the range inclusive.

### Command Line Interface (CLI)

The frames CLI tool will process all the files in a scene's `media/scenes/<name>`
directory to build the scenes video.
