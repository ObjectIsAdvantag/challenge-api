//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//


const debug = require("debug")("api:challenges");
const express = require("express");

// default routing properties
const router = express.Router({ "caseSensitive": true, "strict": false });

// for parsing application/json
const bodyParser = require("body-parser");
router.use(bodyParser.json());

// Extra imports 
const sendError = require('../utils').sendError;
const sendSuccess = require('../utils').sendSuccess;

//
// In-memory store
//
var datastore = {};

// Current plan for PixelsCamp
const day1 = {    
    "id" : "pixelscamp2017-day1",
    "event_id" : "pixelscamp2017",

    // descriptions: title, slug, rules

    // questions

    // ISO format, GMT 
    "begin" : "2017-09-28T10:00:00.000Z", // 9AM, Lisbon (GMT+1)
    "end" : "2017-09-28T18:00:00.000Z", // 5PM, Lisbon (GMT+1)

    // [TODO]compute from current time
    // not started, active, cancelled, finished
    "status" : "not started"
}
datastore.challenges = [day1];


// List challenges
router.get("/", function (req, res) {

    return sendSuccess(res, 200, datastore.challenges);
});


module.exports = router;