# Installing Emscripten SDK

- Need brew for MacOS

## Install cmake

Mac
```
brew install cmake
```

Linux
```
sudo apt-get install cmake          # Debian Linux
```

Windows

- to be updated

## Install SDK

### Linux/Mac

```
 cd ~
 wget https://s3.amazonaws.com/mozilla-games/emscripten/releases/emsdk-portable.tar.gz
 tar -xvf emsdk-portable.tar.gz
 cd emsdk-portable
 ./emsdk update
 ./emsdk install sdk-incoming-64bit
```

### Windows

https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html#platform-notes-installation-instructions-sdk
