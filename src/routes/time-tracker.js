const path = require('path');
const express = require('express');

const Authorize = require(path.join(__dirname, '../shared', 'authorize.js'));
const TimeTracker = require(path.join(__dirname, '../models', 'time-tracker.js'));
const TimeTrackerReport = require(path.join(__dirname, '../models', 'time-tracker-report.js'));


const router = express.Router();

router.get('/', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    return false;
  }
  let date = new Date();
  date = date.toJSON();
  TimeTracker.findOne({ user: res.locals.uid, date: date}, 'presence recent breaks', (err, result) => {
    if(err) {
      res.status(500)
        .json({"code": 500, "type": "string", "data": "Internal server error."});
    } else {
      res.status(200)
        .json({"code": 200, "type": "json", "data": result});
    }
  });
});
router.post('/login', Authorize.verifyToken, (req, res) => {
  if (!res.locals.authenticated) {
    return false;
  }
  let dateTime = new Date();
  dateTime = dateTime.toJSON();
  TimeTracker.findOne({ user: res.locals.uid}, (err, result) => {
    if(err) {
      res.status(500)
        .json({"code": 500, "type": "string", "data": "Internal server error."});
    } else {
      if(result == null) {//Firsttime user entry, this and below can replace with upsert
        TimeTracker({
          user: res.locals.uid,
          date: dateTime.split('T')[0],
          presence: {
            entry: dateTime,
            exit: ""
          },
          recent:{start:""},
          breaks: [],
          updatedAt: dateTime
        }).save((err, saved) => {
          if(err) {
            res.status(500)
              .json({"code": 500, "type": "string", "data": "Internal server error."});
          } else {
            res.status(201)
              .json({"code": 201, "type": "string", "data": "Request submitted successfully."});
          }
        })
      } else if(result.date != dateTime.split('T')[0]) {//if user old data present
        TimeTrackerReport(result)
          .save((err, save) => {
            if(err) {
              res.status(500)
                .json({"code": 500, "type": "string", "data": "Internal server error."});
            } else {
              res.status(201)
                .json({"code": 201, "type": "string", "data": "Request submitted successfully."});
            }
          });
        let trackerObj = {
          date: dateTime.split('T')[0],
          presence: {
            entry: dateTime,
            exit: ""
          },
          recent: {
            start: ""
          },
          breaks: [],
          updatedAt: dateTime
        };
        TimeTracker.findOneAndUpdate({
            "user": res.locals.uid,
            "date": {
              "$ne": dateTime.split('T')[0]
            }
          },
          { "$set": Object.assign(result, trackerObj)},
          (err, updated) => {
            if(err) {
              res.status(500)
                .json({"code": 500, "type": "string", "data": "Internal server error."});
            } else {
              res.status(201)
                .json({"code": 201, "type": "string", "data": "Request submitted successfully."});
            }
          });
      }
    }
  });
});
router.put('/logout', Authorize.verifyToken, (req, res) => {
  if (!res.locals.authenticated) {
    return false;
  }
  let dateTime = new Date();
  dateTime = dateTime.toJSON();
  TimeTracker.findOne({
    "user": res.locals.uid,
    "date": dateTime.split('T')[0]
  }, (err, result) => {
    if (err) {
      res.status(400)
        .json({"code": 400, "type": "string", "data": "Invalid request."});
    } else if (result == null) {
      res.status(409)
        .json({"code": 409, "type": "string", "data": "Entry not exist."});
    } else {
      if (result.recent.start != '') {
        result.breaks.push({
          start: result.recent.start,
          end: dateTime
        });
        result.recent.start = '';
      }
      result.presence.exit = dateTime;
      result.updatedAt = dateTime;
      TimeTracker.findOneAndUpdate({ 
          "user": res.locals.uid,
          "date": dateTime.split('T')[0]
        }, 
        { "$set": result}, 
        (err, trackerUpdate) => {
          if (err) {
            res.status(400)
              .json({"code": 400, "type": "string", "data": "Invalid request."});
          } else {
            res.status(201)
              .json({"code": 201, "type": "string", "data": "Request submitted successfully."});
          }
      });
    }
  });
});
router.put('/swipeout', Authorize.verifyToken, (req, res) => {
  if (!res.locals.authenticated) {
    return false;
  }
  let dateTime = new Date();
  dateTime = dateTime.toJSON();
  TimeTracker.findOneAndUpdate({
      "user": res.locals.uid,
      "recent.start": {
        "$eq": ""
      },
      "date": dateTime.split('T')[0]
    },
    {
      "$set": {
        "recent.start": dateTime,
        "updatedAt": dateTime
      }
    },
    (err, result) => {
      if (err) {
        res.status(500)
          .json({"code": 500, "type": "string", "data": "Internal server error."});
      } else {
        res.status(201)
          .json({"code": 201, "type": "string", "data": "Request submitted successfully."});
      }
    });
});
router.put('/swipein', Authorize.verifyToken, (req, res) => {
  if (!res.locals.authenticated) {
    return false;
  }
  let dateTime = new Date();
  dateTime = dateTime.toJSON();
  TimeTracker.findOne({
    "user": res.locals.uid,
    "recent.start": {
      "$eq": ""
    },
    "date": dateTime.split('T')[0]
    }, (err, result) => {
      if (err) {
        res.status(500)
          .json({"code": 500, "type": "string", "data": "Internal server error."});
      } else if (res == null) {
        res.status(409)
          .json({"code": 409, "type": "string", "data": "Entry not exist."});
      } else {
        result.breaks.push({
          start: result.recent.start,
          end: dateTime
        });
        result.recent.start = '';
        result.updatedAt = dateTime;
        TimeTracker.updateOne({
            "user": res.locals.uid,
            "recent.start": {
              "$ne": ""
            },
            "date": dateTime.split('T')[0]
          }, {
            "$set": result
          }, (err, update) => {
            if (err) {
              res.status(500)
                  .json({"code": 500, "type": "string", "data": "Internal server error."});
            } else {
              if (update.nModified == 0) {
                res.status(409)
                  .json({"code": 409, "type": "string", "data": "Entry not exist."});
              } else {
                res.status(201)
                  .json({"code": 201, "type": "string", "data": "Request submitted successfully."});
              }
            }
          }
        )
      }
  });
});




/*
//Direct content push from post 
router.post('/sync-with-local', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    return false;
  }
  let date = new Date();
  date = date.toJSON();
  TimeTracker.findOne({ user: res.locals.uid, date: date.split('T')[0]},  (err, result) => {
    if(err) {
      res.status(400).send(err);
    } else {
      new TimeTracker({
        user: res.locals.uid,
        date: date,
        presence: {
          entry: date,
          exit: ""
        },
        recent: {
          start: ""
        },
        breaks: [
          {
            start: "",
            end: ""
          }
        ],
        updatedAt: date
      }).save((err, data) => {
        console.log(err);
        console.log(data);
      });




      res.send(result);
    }

  });
});*/

module.exports = router;
