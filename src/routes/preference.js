const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const Preference = require(path.join(__dirname, '../models', 'preference.js'));
const Authorize = require(path.join(__dirname, '../shared', 'authorize.js'));

router.get('/', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    res.status(403)
      .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed."}));
    return false;
  }
  Preference.findOne({
      _id: res.locals.uid
  })
  .exec((err, doc) => {
    if(err) {
      res.status(400)
        .json(JSON.stringify({"code": 400, "type": "string", "data": "Invalid password, contact Admin."}));
    } else {
      if(!doc) {
        doc = {
          timezone: 'Asia/Kolkata',
          timeTracker: {
            weekMinTime: 40,
            dayMinTime: 6,
            halfDayMinTime: 5
          }
        };
      }
      res.status('200')
        .json(JSON.stringify({"code": 200, "type": "object", "data": doc}));
    }
  });
});

router.put('/', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    res.status(403)
      .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed."}));
    return false;
  }
  Preference.updateOne({
      _id: res.locals.uid
    }, {
      "$set": {
        timezone: req.body.timezone,
        timeTracker: {
          weekMinTime: req.body.timeTracker.weekMinTime,
          dayMinTime: req.body.timeTracker.dayMinTime,
          halfDayMinTime: req.body.timeTracker.halfDayMinTime
        }
      }
    }, {
      upsert: true
    })
    .exec((err, update) => {
      if(err) {
        res.status(500)
          .json(JSON.stringify({"code": 500, "type": "string", "data": "Internal server error."}));
      } else if(update) {
        res.status('200')
          .json(JSON.stringify({"code": 200, "type": "string", "data": 'Preference updated.'}));
      }
    });
});

module.exports = router;