
// example.js 
const getStdin = require('get-stdin');

getStdin().then(str => {
    let submissions = JSON.parse(str);
    var ignored = 0;

    console.log(`before deduplication: total of ${submissions.length} submissions`);

    //
    // Filter out other challenges
    //
    let filteredChallenge = [];
    const challenge = process.env.CHALLENGE || `day1`;
    submissions.forEach(function (elem) {
        if (!(elem.challenge) || (elem.challenge != challenge)) {
            console.log(`${++ignored}: ignoring entry: ${elem.guess}, from other challenge: ${elem.challenge}`);
            return;
        }

        filteredChallenge.push(elem);
    });

    //
    // Remove invalid entries and duplicates
    //
    var filtered = {};
    filteredChallenge.forEach(function (elem) {
        // An entry MUST have a profile, a guess, a date and a name (either full / first or last)
        if (!(elem.profile && ((elem.first && elem.last) || (elem.fullname)) && elem.guess && elem.createdAt)) {
            console.log(`${++ignored}: ignoring invalid entry: ${elem.guess}, from: ${elem.fullname} or (${elem.first} / ${elem.last})`);
            return;
        }

        // Remove invalid entries (non integer guesses)
        let parsed = parseInt(elem.guess);
        if (!parsed) {
            console.log(`${++ignored}: ignoring invalid guess: ${elem.guess}, from: ${elem.fullname} or (${elem.first} / ${elem.last})`);
            return;
        }
        elem.guess = parsed;

        // Keep only ealiest entry for a profile
        var exists = filtered[elem.profile];
        if (exists) {
            // Remove newer entries, keeping the earlist
            if (exists.createdAt < elem.createdAt) {
                console.log(`${++ignored}: ignoring duplicate from: ${elem.fullname} | (${elem.first} / ${elem.last}), profile: ${elem.profile}, priorizing earliest!`);
                return;
            }
        }

        // add entry
        filtered[elem.profile] = elem;
    });

    // log out
    var length = Object.keys(filtered).length;
    console.log(`after deduplication: total of ${length} submissions`);

    
    //
    // Creating output
    //
    var output = [];
    Object.keys(filtered).forEach(function(key) {
        output.push(filtered[key]);
    });

    require('fs').writeFileSync("./deduplicated.json", JSON.stringify(output));
});
