# Challenge API

This REST API is a mock to run challenges at events.
Basically participants can submit an answer to a challenge,
and an algorithm will pick a winnder.

The data are mocked in this example.

Here is a [postman collection](https://www.getpostman.com/collections/e0e12335f000aec5aa13) and [HTML documentation](https://documenter.getpostman.com/view/30210/cloudy-challenge-pixelscamp-public/6tgV21e#8fa7e9d1-9a9f-3436-0d65-3791d689b4d4) of the REST API.

## Quick start

```shell
git clone
cd 
npm install
DEBUG=api* node server.js
```

## Resources

If runnning locally, replace $server with http://localhost:8080
if running the heroku live demo, replace with https://pixelscamp-challenge.herokuapp.com

### List challenges

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


### Submit answer

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


### List answers

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


### Compute winners

```shell
GET {{server}}/api/challenges/pixelscamp2017-day1/winners?weight=12345
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
        },
        "score": 1.4224165
    }
]
```
