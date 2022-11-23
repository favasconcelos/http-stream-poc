var express = require("express");
var router = express.Router();

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

router.get("/", async function (req, res, next) {
  res.set("Content-Type", "text/event-stream");
  res.set("Cache-Control", "no-store");

  const arr = [1, 2, 3];
  let data = { value: arr.length, time: new Date().toISOString() };
  res.write("event: size\n");
  res.write(`data: ${JSON.stringify(data)}\n\n`);

  for (let i = 0; i < arr.length; i++) {
    data = { value: arr[i], time: new Date().toISOString() };
    res.write("event: data\n");
    res.write(`id: ${i}\n`);
    const content = `data: ${JSON.stringify(data)}\n\n`;
    res.write(content);
    console.log(content);
    const rand = Math.floor(Math.random() * 10);
    await sleep(rand + 1 * 1000);
  }
  res.end();
});

module.exports = router;
