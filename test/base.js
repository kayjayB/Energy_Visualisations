"use strict";
let test = require("tape");

test("Hello World: hello should greet the world", function(t) {
    let hello = "world";
    t.equal(hello, "world");
    t.end();
});