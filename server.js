//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//


const debug = require("debug")("api");
const express = require("express");



//
// Setting up common services 
//
const app = express();

// Inject in-memory data store for static / non persisted resources
app.locals.datastore = {};



//
// Technical headers, middleware
//

app.set("x-powered-by", false);
app.set("etag", false);

var prefix = process.env.PREFIX || "SSF";
const uuid = require('uuid/v4');
app.use(function (req, res, next) {
    res.setHeader("Cache-Control", "no-cache"); 

    // add Trackingid
    res.locals.trackingId = prefix + "_" + uuid();
    res.setHeader("Trackingid", res.locals.trackingId);

    next();
});

// Healthcheck
app.locals.started = new Date(Date.now()).toISOString();
app.get("/", function(req, res) {
    res.status(200).send({
        "service" : "Challenge API",
        "description" : "Used at events for participants to submit answers",
        "version" : require('./package.json').version,
        "up-since" : app.locals.started
    });
});


//
// Loading API resources
//

const challengesAPI = require("./resources/challenges");
app.use("/api/challenges", challengesAPI);


//
// Start  server
//
const port = process.env.PORT || 8080;
app.listen(port, function () {
    debug(`Server started on port: ${port}`);
    console.log(`Server started on port: ${port}`);
});
