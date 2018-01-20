# zstream-server

> A music streaming server written from scratch to stream your home library

## Installation

```bash
yarn global add zstream-server
```

## Usage

To use ZStream, all you have to do is run the `zstream` command while inside a music folder. The structure should be as follows:

```
root
├── Artist 1
│   ├── Album 1
│   │   ├── Track 1
│   │   ├── Track 2
│   │   ├── Track 3
│   │   └── ...
│   └── Album 2
│       └── ...
├── Artist 2
│   ├── Album 1
│   └── ...
└── ...
```

Then you would just run `zstream` from within the root directory. All music will be automatically loaded and served to `127.0.0.1:3000`.

## Join Me
[![Discord Badge](https://github.com/Rayzr522/ProjectResources/raw/master/RayzrDev/badge-small.png)](https://discord.io/rayzrdevofficial)