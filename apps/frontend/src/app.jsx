import { useCallback, useEffect, useRef, useState } from "react";
import "./app.css";

const STATES = {
  IDLE: "idle",
  PROGESS: "progress",
  DONE: "done",
  ERROR: "error",
};

function useHttpStream() {
  const { current: api } = useRef({ size: 0, progress: 0, evtSource: null });
  const { size, progress } = api;
  const [error, setError] = useState();
  const [data, setData] = useState([]);
  const [state, setState] = useState(STATES.IDLE);

  const handleError = useCallback((event) => {
    // console.log("onError", { event });
    cancel();
    const error = event.data
      ? JSON.parse(event.data)
      : {
          status: 500,
          message: "Something went wrong.",
        };
    setError(error);
    setState(STATES.ERROR);
  }, []);

  const handleOpen = useCallback((event) => {
    // console.log("onOpen", { event });
    api.size = 0;
    api.progress = 0;
    setState(STATES.PROGESS);
  }, []);

  const handleSize = useCallback((event) => {
    // console.log("onSize", { event });
    api.size = JSON.parse(event.data).value;
  }, []);

  const handleData = useCallback((event) => {
    // console.log("onData", { event });
    const currentProgress = api.progress + 1;
    api.progress = currentProgress;

    const item = JSON.parse(event.data);
    setData((data) => [...data, item]);

    if (api.progress >= api.size) {
      cancel();
      setState(STATES.DONE);
    }
  }, []);

  function request(url) {
    const evtSource = new EventSource(url);
    evtSource.addEventListener("open", handleOpen);
    evtSource.addEventListener("size", handleSize);
    evtSource.addEventListener("data", handleData);
    evtSource.addEventListener("error", handleError);
    api.evtSource = evtSource;
  }

  function cancel() {
    return api.evtSource?.close();
  }

  return { error, data, state, size, progress, request, cancel };
}

export function App() {
  const { error, data, state, request, cancel } = useHttpStream();

  async function handleClick(id) {
    request(`http://localhost:5174?id=${id}`);
  }

  useEffect(() => {
    // cancel the request once unmount the component
    return cancel;
  }, []);

  return (
    <div className="app">
      <div>
        <button
          disabled={state === STATES.PROGESS}
          onClick={() => handleClick(1)}
        >
          request-1 [{state}]
        </button>
      </div>
      {error && <div>{JSON.stringify(error, null, 2)}</div>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
