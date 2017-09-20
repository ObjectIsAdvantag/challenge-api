# Challenge API

if runnning locally with node server.js, then $server = http://localhost:8080 below

## List challenges

```shell
GET {{server}}/api/challenges
```

```json
[
    {
        "id": "pixelscamp2017-day1",
        "event_id": "pixelscamp2017",
        "begin": "2017-09-28T10:00:00.000Z",
        "end": "2017-09-28T18:00:00.000Z",
        "status": "not started"
    }
]
```


## Submit answer

```shell
POST {{server}}/api/challenges/pixelscamp2017-day1/answers
{
	"weight" : 12345
}
```

```json
{
    "createdAt": "2017-09-20T16:34:24.204Z",
    "data": {
        "weight": 12345
    },
    "submitter": {
        "email": "stsfartz@cisco.com",
        "devnetId": "123456789",
        "firstName": "Stève",
        "lastName": "Sfartz"
    }
}
```


## List answers

```shell
GET {{server}}/api/challenges/pixelscamp2017-day1/answers
```

```json
[
    {
        "createdAt": "2017-09-20T16:34:24.204Z",
        "data": {
            "weight": 12345
        },
        "submitter": {
            "email": "stsfartz@cisco.com",
            "devnetId": "123456789",
            "firstName": "Stève",
            "lastName": "Sfartz"
        }
    }
]
```
