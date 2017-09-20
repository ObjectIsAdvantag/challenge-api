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
    "id": "pixelscamp2017-day1",
    "event_id": "pixelscamp2017",

    // descriptions: title, slug, rules

    // questions

    // ISO format, GMT 
    "begin": "2017-09-28T10:00:00.000Z", // 9AM, Lisbon (GMT+1)
    "end": "2017-09-28T18:00:00.000Z", // 5PM, Lisbon (GMT+1)

    // [TODO]compute from current time
    // not started, active, cancelled, finished
    "status": "not started"
}
datastore.challenges = [day1];


//
// List challenges
//

router.get("/", function (req, res) {

    return sendSuccess(res, 200, datastore.challenges);
});


//
// Post answer
//

datastore.answers = {};

router.post("/:challenge/answers", function (req, res) {

    // [TODO] Check authentication

    // Retreive submitter's info
    const submitterProfile = "123456789";
    const submitterEmail = "stsfartz@cisco.com";
    const submitterFirstname = "Stève";
    const submitterLastname = "Sfartz";

    // Check we have valid submitter info
    if (!submitterProfile) {
        return sendError(res, 401, "could not retreive the DevNet member profile", "no profile id");
    }
    if (!submitterEmail || !submitterFirstname || !submitterLastname) {
        return sendError(res, 400, "could not retreive the DevNet member profile", "email, first name or last name are missing");
    }

    // Check the challenge exists
    const challengeId = req.params.challenge;
    if (!challengeId) {
        return sendError(res, 403, "challenge does not exist", `no challenge found with id: ${challengeId}`);
    }

    // Check the submitter has not already submitted
    var submitterAnswers = datastore.answers[submitterProfile];
    if (submitterAnswers) {
        const existing = submitterAnswers[challengeId];
        if (existing) {
            return sendError(res, 409, "sorry but we already have a submission for this DevNet member", `created on ${existing.createdAt}`);
        }
    }
    else {
        submitterAnswers = {};
    }

    // Check answer is correct
    const weight = req.body.weight;
    if (!weight) {
        return sendError(res, 400, "incorrect submission", "no weight specified");
    }

    // Store answer
    const newAnswer = {
        "createdAt": new Date(Date.now()).toISOString(),
        "data": {
            "weight": weight
        },
        "submitter": {
            "email": submitterEmail,
            "devnetId": submitterProfile,
            "firstName": submitterFirstname,
            "lastName": submitterLastname
        }
    };
    submitterAnswers[challengeId] = newAnswer;
    datastore.answers[submitterProfile] = submitterAnswers;

    return sendSuccess(res, 201, newAnswer);
});


//
// List answers
//
router.get("/:challenge/answers", function (req, res) {

    // [TODO] Check authentication


    // Check the challenge exists
    const challengeId = req.params.challenge;
    if (!challengeId) {
        return sendError(res, 403, "challenge does not exist", `no challenge found with id: ${challengeId}`);
    }

    // Retreive answers for the challenge
    var all = [];
    Object.keys(datastore.answers).forEach(function (submitter) {
        var submitterAnswers = datastore.answers[submitter]
        var submitterAnswerToChallenge = submitterAnswers[challengeId];
        if (submitterAnswerToChallenge) {
            all.push(submitterAnswerToChallenge);
        }
    });

    return sendSuccess(res, 200, all);
});


module.exports = router;