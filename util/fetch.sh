#!/bin/bash

curl -s  -X GET   https://api.smartsheet.com/2.0/sheets/5393227109951364   -H "authorization: Bearer $SMARTSHEET_TOKEN"  | jq '[ .rows[] | { profile: .cells[0].value, first: .cells[1].value , last: .cells[2].value , guess: .cells[3].value , createdAt: .cells[4].value  } ]'
