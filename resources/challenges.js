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


//
// Populate challenges
//

var data = require("fs").readFileSync(__dirname + "/challenges.json", "UTF-8");
datastore.challenges = JSON.parse(data);


//
// List challenges
//

router.get("/", function (req, res) {

    // [TODO] Check authentication
    // Note that this resource could stay public, no sensitive data here

    // Fetch the list of challenges (for the event specified / or not)
    var challenges = datastore.challenges;
    var filter = req.query["event_id"];
    if (filter) {
        var filtered = [];
        Object.keys(challenges).forEach(function (challengeId) {
            var challenge = challenges[challengeId];
            if (challenge.event_id == filter) {
                filtered.push(challenge);
            }
        });
        challenges = filtered;
    }

    // Update the status property depending on the current date, versus start/begin dates
    // enum: not started, active, cancelled, finished
    var now = new Date(Date.now());

    // Check is now was specified as a query parameter
    if (req.query.now) {
        now = new Date(req.query["now"]);
    }

    Object.keys(challenges).forEach(function (challengeId) {
        var challenge = challenges[challengeId];
        challenge.status = updateStatus(challenge, now);
    });

    return sendSuccess(res, 200, challenges);
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

    // [TODO] order by createdDate ascending

    return sendSuccess(res, 200, all);
});


//
// Compute winners
//

router.get("/:challenge/winners", function (req, res) {

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

    // [TODO] Compute the top 50 winners

    return sendSuccess(res, 200, all);
});


module.exports = router;


//
// Utilities
//

function updateStatus(challenge, now) {

    if (challenge.cancelled) {
        return "cancelled";
    }

    if (now < new Date(challenge.begin)) {
        return "not started";
    }

    if (now > new Date(challenge.end)) {
        return "finished";
    }

    return "active";
}