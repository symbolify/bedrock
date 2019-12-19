const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const User = require(path.join(__dirname, '../models', 'user.js'));
const Authorize = require(path.join(__dirname, '../shared', 'authorize.js'));
/*
User Status:
a: Active
i: inactive
p: pending
*/
router.post('/register', (req, res) => {
  if(typeof req.body.password === 'undefined' || req.body.password === '') {
    res.status(400)
      .json(JSON.stringify({"code": 400, "type": "string", "data": "Invalid password."}));
  } else {
    bcrypt.hash(req.body.password, 10, (err, encPass) => {
      if(err) {
        res.status(400)
          .json(JSON.stringify({"code": 400, "type": "string", "data": "Invalid password, contact Admin."}));
      } else {
        new User({
          email: req.body.email,
          name: req.body.name,
          password: encPass,
          dob: req.body.dob,
          gender: req.body.gender,
          newsletter: req.body.newsletter,
          created: new Date(),
          updated: new Date(),
          status: 'a'
        }).save((err, doc) => {
          if(err) {
            if(err.code == 11000) {
              res.status(400)
                .json(JSON.stringify({"code": 400, "type": "string", "data": "Registration failed, duplicate email."}));
            } else {
              res.status(400)
                .json(JSON.stringify({"code": 400, "type": "string", "data": "Registration failed, invalid request."}));
            }
          } else {
            res.status(201)
              .json(JSON.stringify({"code": 201, "type": "string", "data": "Registration succeeded."}));
          }
        });
      }
    });
  }
});
router.post('/auth', (req, res) => {
  if(typeof req.body.password == 'undefined' ||
    req.body.password == '' ||
    typeof req.body.email == 'undefined' ||
        req.body.email == '') {
      res.status(400)
        .json(JSON.stringify({"code": 400, "type": "string", "data": "Invalid request."}));
  } else {
    User.findOne({
        email: req.body.email
      }, '_id name email password status', (err, doc) => {
        if(err) {
          res.status(400)
            .json(JSON.stringify({"code": 400, "type": "string", "data": "Authentication failed."}));
        } else if(doc == null) {
          res.status(400)
            .json(JSON.stringify({"code": 400, "type": "string", "data": "Authentication failed."}));
        } else if(doc && doc.password) {
          if(doc.status == 'i') {
            res.status(403)
              .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed, contact Admin."}));
          } else {
            bcrypt.compare(req.body.password, doc.password, (err, statusCode) => {
              if(err) {
                res.status(403)
                  .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed."}));
              } else if(statusCode) {
                Authorize.sign({
                    uid: doc._id,
                    name: doc.name
                  }, (data) => {
                    if(data.code == 202) {
                      res.status(data.code)
                        .json(JSON.stringify({"code": data.code, "type": "string", "data": data.data}));
                    } else {
                      res.status(403)
                        .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed."}));
                    }
                  });
              } else {
                res.status(403)
                  .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed."}));
              }
            });
          }
        }
    });
  }
});
router.post('/verify', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    res.status(403)
      .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed."}));
    return false;
  }
  res.status('202')
    .json(JSON.stringify({"code": 202, "type": "string", "data": "Authentication succeeded."}));
});
router.get('/profile', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    res.status(403)
      .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed."}));
    return false;
  }
  User.findOne({_id: res.locals.uid})
  .select({_id: 0, name: 1, email: 1})
  .exec((err, doc) => {
      if(err) {
        res.status(400)
          .json(JSON.stringify({"code": 400, "type": "string", "data": "Invalid request."}));
      } else if(doc) {
        res.status('200')
          .json(JSON.stringify({"code": 200, "type": "object", "data": doc}));
      }
  });
});
router.put('/profile', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    res.status(403)
      .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed."}));
    return false;
  }
  User.find({email: req.body.email, _id: {$ne: res.locals.uid}})
    .exec((err, doc) => {
      if(err) {
        res.status(400)
          .json(JSON.stringify({"code": 400, "type": "string", "data": "Invalid request."}));
      } else if(res) {
        if(doc.length > 0) {
          res.status(400)
            .json(JSON.stringify({"code": 400, "type": "string", "data": "Requested Email already exist."}));
        } else {
          User.updateOne({
              _id: res.locals.uid
            }, {
              "$set": {
                "name": req.body.name,
                "email": req.body.email
              }
            })
            .exec((err, update) => {
              if(err) {
                res.status(500)
                  .json(JSON.stringify({"code": 500, "type": "string", "data": "Internal server error."}));
              } else if(update) {
                res.status('200')
                  .json(JSON.stringify({"code": 200, "type": "string", "data": 'Profile updated.'}));
              }
            });
        }
      }
    });
});
router.put('/change-password', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    res.status(403)
      .json(JSON.stringify({"code": 403, "type": "string", "data": "Authentication failed."}));
    return false;
  }
  bcrypt.hash(req.body.newPassword, 10, (err, newPass) => {
    if(err) {
      res.status(400)
        .json(JSON.stringify({"code": 400, "type": "string", "data": "Invalid password, contact Admin."}));
    } else {
      User.findOne({
          _id: res.locals.uid
        })
        .select({_id: 0, password: 1})
        .exec((err, doc) => {
          if(err) {
            res.status(500)
              .json(JSON.stringify({"code": 500, "type": "string", "data": "Internal server error."}));
          } else if(doc) {
            bcrypt.compare(req.body.currentPassword, doc.password, (err, matchStatus) => {
              if(err) {
                res.status(400)
                  .json(JSON.stringify({"code": 400, "type": "string", "data": "Wrong password."}));
              } else if(matchStatus) {
                User.updateOne({
                  _id: res.locals.uid
                }, {
                  "$set": {
                    "password": newPass
                  }
                })
                .exec((err, update) => {
                  if(err) {
                    res.status(500)
                      .json(JSON.stringify({"code": 500, "type": "string", "data": "Internal server error."}));
                  } else if(update) {
                    res.status('200')
                      .json(JSON.stringify({"code": 200, "type": "string", "data": "Password updated."}));
                  }
                });
              } else {
                res.status(400)
                  .json(JSON.stringify({"code": 400, "type": "string", "data": "Wrong password."}));
              }
            })
          }
        });
    }
  });
});

module.exports = router;