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

    // Check is now was specified as a query parameter
    var now = new Date(Date.now());
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
// Submit answer
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
        return sendError(res, 403, "challenge not found", "challenge identifier not found on the GET query path");
    }
    var challenge = datastore.challenges.find(function (elem) {
        return (elem.id == challengeId);
    });
    if (!challenge) {
        return sendError(res, 403, "challenge not found", `no challenge found with id: ${challengeId}`);
    }

    // Is the challenge still opened
    var now = new Date(Date.now());
    if (req.query.now) {
        now = new Date(req.query["now"]);
    }
    var status = updateStatus(challenge, now);
    if (status != "active") {
        return sendError(res, 403, "challenge not active", `status: '${status}' for challenge : ${challengeId}`);
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

    // Check answer is correctly formatted
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
        return sendError(res, 403, "challenge not found", "challenge identifier not found on the GET query path");
    }
    var challenge = datastore.challenges.find(function (elem) {
        return (elem.id == challengeId);
    });
    if (!challenge) {
        return sendError(res, 403, "challenge not found", `no challenge found with id: ${challengeId}`);
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
        return sendError(res, 403, "challenge not found", "challenge identifier not found on the GET query path");
    }
    var challenge = datastore.challenges.find(function (elem) {
        return (elem.id == challengeId);
    });
    if (!challenge) {
        return sendError(res, 403, "challenge not found", `no challenge found with id: ${challengeId}`);
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
    var max = 50;
    if (req.query.max) {
        max = parseInt(req.query.max);
        delete req.query.max
    }
    var winners = pickWinners(challenge, all, req.query, max);

    return sendSuccess(res, 200, winners);
});


module.exports = router;


//
// Utilities
//

function updateStatus(challenge, now) {
    // Pick current time if now is not specified
    if (!now) {
        now = new Date(Date.now());
    }

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


function pickWinners(challenge, answers, query, max) {

    // Check solution passed as query parameters is well formatted
    if (!query.weight) {
        debug(`weight not found in solution submitted for challenge: ${challenge.id}`);
        return undefined;
    }
    var weight = parseInt(query.weight);
    if (!weight) {
        debug(`wrong solution format submitted for challenge: ${challenge.id}`);
        return undefined;
    }

    // Add a score to each answer
    var scored = answers.map(function (elem) {
        // Integer part of the score is the proximity to the answer
        elem.score = Math.abs(elem.data.weight - weight);

        // Floating part of the scoreis the proximity to the challenge start
        var seconds = new Date(elem.createdAt).getTime() - new Date(challenge.begin).getTime();
        if (seconds < 0) {
            debug(`unexpected answer from ${elem.submitter.devnetId}, submitted before challenge began: ${challenge.id}}`);
            elem.score = 100000;
        }
        else {
            elem.score = parseFloat("" + elem.score + "." + seconds);
        }

        return elem;
    });

    // Sort by score
    var sorted = scored.sort(function (answer1, answer2) {
        return (answer2 - answer1);
    });

    // Return first max answers
    if (max) {
        sorted = sorted.slice(0, max);
    }

    return sorted;
}