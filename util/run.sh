#!/bin/bash

echo "fetching submissions..."
./fetch.sh > ./submissions.json

echo "deduplicating..."
cat submissions.json | CHALLENGE=day1 node deduplicate.js

echo "now I am ready to run THE final computation!" 

echo "please enter the exact weight (in grams):"

read weight

echo "got it, now computing list of winners..."

node pickwinner.js $weight

cat winners.json | jq -C "."
