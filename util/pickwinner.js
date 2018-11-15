
// Read args
var weight = parseInt(process.argv[2]);
if (!weight) {
    console.log(`wrong solution format submitted for challenge`);
    return undefined;
}
console.log(`looking for best answer close to ${weight}`);


// Read input
const data = require('fs').readFileSync("./deduplicated.json");
const answers = JSON.parse(data);
console.log(`picking among ${answers.length} answers`);

// Add a score to each answer
let challengeStart = process.env.CHALLENGE_START || "2017-09-22T09:30:00Z";
let scored = answers.map(function (elem) {
    // Integer part of the score is the proximity to the answer
    elem.score = Math.abs(elem.guess - weight);

    // Floating part of the score is the proximity to the challenge start
    var seconds = new Date(elem.createdAt).getTime() - new Date(challengeStart).getTime();
    if (seconds < 0) {
        console.log(`unexpected answer from ${elem.profile}, submitted before challenge began`);
        elem.score = 100000;
    }
    else {
        elem.score = parseFloat("" + elem.score + "." + seconds);
    }

    return elem;
});

// Sort by score
let sorted = scored.sort(function (answer1, answer2) {
    return (answer1.score - answer2.score);
});

// Return first max answers
sorted = sorted.slice(0, 50);

// Write data to output
require('fs').writeFileSync("./winners.json", JSON.stringify(sorted));
