import { useState } from "react";
import "./app.css";

function request() {
  return new Promise((resolve, reject) => {
    let data = [];
    let size;
    let currentMessageIndex;
    const evtSource = new EventSource("http://localhost:5174");
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
  const [data, setData] = useState();

  async function handleClick() {
    console.log("handleClick");
    const result = await request();
    console.log(result);
  }

  return (
    <div className="app">
      <button onClick={handleClick}>request</button>
      <pre>{data}</pre>
    </div>
  );
}
