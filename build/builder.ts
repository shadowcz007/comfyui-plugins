import { build } from "electron-builder";
let platform = process.platform;
let isMac = platform === 'darwin'

build({
  config: {
    appId: "com.lab.plugins",
    productName: "Plugins",
    artifactName: "${productName}-${version}-${platform}-${arch}.${ext}",
    files: ["dist/**/*"],
    extraMetadata: {
      main: "dist/main.js"
    },
    extraResources: [
      {
        from: "assets",
        to: "assets" //把根目录下的assets资源拷贝到resources里
      }
    ],
    asar: true,
    npmRebuild: false,
    compression: isMac ? "normal" : "maximum",
    directories: {
      output: "release",
    },
    win: {
      "icon": "assets/logo.png",
      "verifyUpdateCodeSignature": false,
      "target": [
        "nsis"
      ]
    },
    mac: {
      "icon": "assets/logo.png",
      "target":{
        "target": "zip",
        "arch": [
          "x64",
          "arm64"
        ]
      },
      "identity": null,
    },
    "nsis": {
      "createDesktopShortcut": true, // 创建桌面图标
      "createStartMenuShortcut": true, // 创建开始菜单图标
      // "include": "build/installer.nsh"
    }
    // linux: {
    //   icon: "build/icon.png"
    // }
  },
}).then(() => {
  console.log("Build successful");
})
  .catch((err) => {
    console.error(err);
  });