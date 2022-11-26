const express = require("express");
const router = express.Router();

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

router.get("/", async function (req, res, next) {
  const { id } = req.query;

  res.set("Content-Type", "text/event-stream");
  res.set("Cache-Control", "no-store");

  // fake an error if the ID is 2
  if (id === "2") {
    res.write("event: error\n");
    const data = { status: 412, message: "something" };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    return res.end();
  }

  const arr = [1, 2, 3];
  res.write(`id: ${id}\n`);
  res.write("event: size\n");
  let data = { value: arr.length, time: new Date().toISOString() };
  res.write(`data: ${JSON.stringify(data)}\n\n`);

  for (let i = 0; i < arr.length; i++) {
    data = { id, value: arr[i], time: new Date().toISOString() };
    res.write("event: data\n");
    const content = `data: ${JSON.stringify(data)}\n\n`;
    res.write(content);
    // console.log(content);
    // fake a async process to add some delay
    await sleep(1000);
  }
  res.end();
});

module.exports = router;
