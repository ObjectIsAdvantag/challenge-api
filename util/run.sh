#!/bin/bash

echo "fetching submissions..."
./fetch.sh > ./submissions.json

echo "deduplicating..."
cat submissions.json | node deduplicate.js

echo "now I am ready to run final computation!" 

echo "please enter the exact weight (in grams):"

read weight

echo "got it, now computing list of winners..."

node compute.js $weight

cat winners.json | jq -C
