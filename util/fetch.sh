#!/bin/bash

curl -s  -X GET  https://api.smartsheet.com/2.0/sheets/6275510532630404   -H "authorization: Bearer $SMARTSHEET_TOKEN"  | jq '[ .rows[] | { challenge: .cells[0].value, profile: .cells[6].value, fullname: .cells[1].value, first: .cells[2].value , last: .cells[3].value , guess: .cells[4].value , createdAt: .cells[5].value  } ]'
