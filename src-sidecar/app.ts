import * as minimist from "minimist"
import { WebSocketServer } from "ws"
import scannerEvents from "./scanner"
import { AdapterSourceDestination } from "etcher-sdk/build/scanner/adapters/adapter"

const DEBUG = true

// parse arguments
const argv = minimist(process.argv.slice(2))
const port = argv.port || 8080
const host = argv.host || "localhost"

let messaging: any

// set the proper mode - state machine
if (argv.privileged) {
  // we're privileged, better be careful
} else {
  // not privileged, we can't flash, but we can scan
}

// open websocket server
if (argv.websockets) {
  // Websocket will handle communication with the frontend
  const wss = new WebSocketServer({ port, host })

  wss.on("connection", function connection(ws) {
    messaging = ws

    ws.on("error", console.error)

    ws.on("message", function message(data) {
      if (DEBUG) console.log("message from client: ", data)
      const response = parseCommand(String(data))
      // if (response) ws.send(response)
    })

    ws.on("close", function close() {
      // when the client closes the connection we assume the process is done and exit
      console.log("disconnected")
      process.exit(0)
    })

    ws.send(JSON.stringify({ type: "Connected" }))
  })
}

const parseCommand = async (message: string) => {
  const parsed = JSON.parse(message)
  const command = parsed.value

  switch (command) {
    case "scan":
      await scannerEvents(messaging)
      break
  }
}

const hello = async () => {
  console.log("Server is runnin on port", port)
}

hello()

export default hello
