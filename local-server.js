"use strict";

const http = require("http");
const handleRequest = require("./server");

const port = Number(process.env.PORT) || 3000;

http.createServer(handleRequest).listen(port, () => {
    console.log(`ithaano athaano is running at http://localhost:${port}`);
});