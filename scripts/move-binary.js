// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

/**
 * This script is used to rename the binary with the platform specific postfix.
 * When `tauri build` is ran, it looks for the binary name appended with the platform specific postfix.
 */

import execa from "execa"
import fs from "fs"
import * as mkdirp from "mkdirp"

const files = [
  {
    src: `src-tauri/binaries/app${process.platform === "win32" ? ".exe" : ""}`,
    dest: `src-tauri/binaries/`,
  },
  // {
  //   src: `node_modules/drivelist/build/Release/drivelist.node`,
  //   dest: `src-tauri/binaries/drivelist/`,
  // },
  // {
  //   src: "node_modules/usb/prebuilds/darwin-x64+arm64/node.napi.node",
  //   dest: `src-tauri/binaries/usb/`,
  // },
  // {
  //   src: "node_modules/drivelist/scripts/linux.sh",
  //   dest: `src-tauri/binaries/drivelist/`,
  // },
  // {
  //   src: "node_modules/drivelist/scripts/win32.bat",
  //   dest: `src-tauri/binaries/drivelist/`,
  // },
]

async function main() {
  const rustInfo = (await execa("rustc", ["-vV"])).stdout
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1]

  if (!targetTriple) {
    console.error("Failed to determine platform target triple")
  }

  files.forEach((file) => {
    const extension = file.src.split(".")[1]

    const destination = `${file.dest}${file.src.split("/").slice(-1)[0]}-${targetTriple}`

    mkdirp.sync(destination.split("/").slice(0, -1).join("/"))
    fs.copyFileSync(file.src, destination)
  })
}

main().catch((e) => {
  throw e
})
