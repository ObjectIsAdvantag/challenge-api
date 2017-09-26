
// example.js 
const getStdin = require('get-stdin');

getStdin().then(str => {
    var submissions = JSON.parse(str);

    console.log(`before deduplication: total of ${submissions.length} submissions`);

    //
    // Remove duplicates
    //
    var filtered = {};
    submissions.forEach(function (elem) {
        if (!(elem.profile && elem.first && elem.last && elem.guess && elem.createdAt)) {
            console.log("ignoring entry:" + elem.guess);
            return;
        }

        var exists = filtered[elem.profile];
        if (exists) {
            // Check data is less recent
            if (exists.createdAt < elem.createdAt) {
                console.log("ignoring duplicate: " + elem.createdAt);
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
