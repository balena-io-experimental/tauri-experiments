import { useEffect, useState, useCallback } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import "./App.css"
import { AdapterSourceDestination } from "etcher-sdk/build/scanner/adapters/adapter"

const DEBUG = true

declare const window: any

function App() {
  // used to delay a little the connection to the server
  const getSocketUrl = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("ws://localhost:8080")
      }, 2000)
    })
  }, [])

  const [backendStarted, setBackendStarted] = useState<boolean>(false)
  const [messageHistory, setMessageHistory] = useState<any[]>([])
  const [deviceList, setDeviceList] = useState<string[]>([])

  /** Ask the rust backend to spawn the flasher nodejs app, that app will ask for privileges */
  // TODO: Abstract away this // This should be "backend agnostic", and first test for an existing flasher backend, if none is found, it can then start one.
  function startBackend(privileged = false) {
    setBackendStarted(true)
    // Be sure to set `build.withGlobalTauri` in `tauri.conf.json` to true
    const invoke = window.__TAURI__.invoke
    // Invoke the command
    invoke("start_backend", { privileged })
  }

  // Connect to Websocket
  const { sendJsonMessage, lastMessage, readyState } = useWebSocket(getSocketUrl, { share: true })

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState]

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage))
      if (lastMessage.type === "message") {
        const data = JSON.parse(lastMessage.data)
        switch (data.type) {
          case "scan_attach":
            setDeviceList((prev) => [...prev, data.data.drive.drive.device])
            break
          case "scan_detach":
            setDeviceList((prev) => prev.filter((device) => device !== data.data.drive.drive.device))
            break
        }
      }
    }
  }, [lastMessage, setMessageHistory])

  useEffect(() => {
    if (!backendStarted) startBackend()
  }, [])

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({ type: "command", value: "scan" }, false)
    }
  }, [readyState])

  return (
    <div className="container">
      <h1>{connectionStatus}!</h1>
      <ul>
        {deviceList.map((device: any) => (
          <li key={device}>{device}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
