import { useState } from "react";
import "./app.css";

function request(requestId) {
  return new Promise((resolve, reject) => {
    let data = [];
    let size;
    let currentMessageIndex;
    const evtSource = new EventSource(
      `http://localhost:5174?requestId=${requestId}`
    );
    evtSource.addEventListener("error", (event) => {
      console.log("onError", event);
      evtSource.close();
      reject(event);
    });
    evtSource.addEventListener("open", () => {
      currentMessageIndex = 0;
    });
    evtSource.addEventListener("size", (event) => {
      console.log("onSize", JSON.parse(event.data));
      size = JSON.parse(event.data).value;
    });
    evtSource.addEventListener("data", (event) => {
      console.log("onData", event);
      currentMessageIndex++;
      data.push(JSON.parse(event.data));
      if (currentMessageIndex >= size) {
        evtSource.close();
        resolve(data);
      }
    });
  });
}

export function App() {
  const [requestId, setRequestId] = useState(1);
  const [data, setData] = useState([]);

  async function doRequest(requestId, startTime) {
    const result = await request(requestId);
    setData((prev) => ({
      ...prev,
      [requestId]: {
        startTime,
        endTime: performance.now(),
        result,
      },
    }));
  }

  async function handleClick(requestId) {
    let startTime = performance.now();
    setRequestId((prev) => prev + 1);
    doRequest(requestId, startTime);
  }

  return (
    <div className="app">
      <button onClick={() => handleClick(requestId)}>request</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
