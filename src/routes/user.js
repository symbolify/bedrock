const path = require("path");
const express = require("express");
const bcrypt = require("bcrypt");
const responseCode = require("../shared/response_code");

const router = express.Router();
const User = require(path.join(__dirname, "../models", "user.js"));
const Authorize = require(path.join(__dirname, "../shared", "authorize.js"));
/*
User Status:
a: Active
i: inactive
p: pending
*/
router.post("/register", (req, res) => {
  if (typeof req.body.password === "undefined" || req.body.password === "") {
    res.status(400).json(JSON.stringify(responseCode.REGISTER.INVAL_NO_PASS));
  } else {
    bcrypt.hash(req.body.password, 10, (err, encPass) => {
      if (err) {
        res.status(400).json(JSON.stringify(responseCode.REGISTER.INVAL_PASS));
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
          zone: req.body.zone,
          zoneCode: req.body.zoneCode,
          status: "a"
        }).save((err, doc) => {
          if (err) {
            if (err.code == 11000) {
              res
                .status(400)
                .json(JSON.stringify(responseCode.REGISTER.INVAL_DUP_EML));
            } else {
              res
                .status(400)
                .json(JSON.stringify(responseCode.REGISTER.INVAL_REQ));
            }
          } else {
            res
              .status(201)
              .json(JSON.stringify(responseCode.REGISTER.VAL_SUCC));
          }
        });
      }
    });
  }
});
router.post("/auth", (req, res) => {
  if (
    typeof req.body.password == "undefined" ||
    req.body.password == "" ||
    typeof req.body.email == "undefined" ||
    req.body.email == ""
  ) {
    res.status(400).json(JSON.stringify(responseCode.AUTH.INVAL_REQ));
  } else {
    User.findOne(
      {
        email: req.body.email
      },
      "_id name email password status",
      (err, doc) => {
        if (err) {
          res.status(400).json(JSON.stringify(responseCode.AUTH.INVAL_AUTH));
        } else if (doc == null) {
          res.status(400).json(JSON.stringify(responseCode.AUTH.INVAL_AUTH));
        } else if (doc && doc.password) {
          if (doc.status == "i") {
            res
              .status(403)
              .json(JSON.stringify(responseCode.AUTH.INVAL_AUTH_ADMIN));
          } else {
            bcrypt.compare(
              req.body.password,
              doc.password,
              (err, statusCode) => {
                if (err) {
                  res
                    .status(403)
                    .json(JSON.stringify(responseCode.AUTH.INVAL_AUTH));
                } else if (statusCode) {
                  Authorize.sign(
                    {
                      uid: doc._id,
                      name: doc.name
                    },
                    data => {
                      if (data.code == 202) {
                        responseCode.AUTH.VAL_SUCC.data = data.data;
                        res
                          .status(data.code)
                          .json(
                            JSON.stringify(responseCode.AUTH.VAL_SUCC.data)
                          );
                      } else {
                        res
                          .status(403)
                          .json(JSON.stringify(responseCode.AUTH.INVAL_AUTH));
                      }
                    }
                  );
                } else {
                  res
                    .status(403)
                    .json(JSON.stringify(responseCode.AUTH.INVAL_AUTH));
                }
              }
            );
          }
        }
      }
    );
  }
});
router.post("/verify", Authorize.verifyToken, (req, res) => {
  if (!res.locals.authenticated) {
    res.status(403).json(JSON.stringify(responseCode.AUTH.INVAL_AUTH));
    return false;
  }
  res.status("202").json(JSON.stringify(responseCode.VERIFY.VAL_SUCC));
});
router.get("/profile", Authorize.verifyToken, (req, res) => {
  if (!res.locals.authenticated) {
    res.status(403).json(JSON.stringify(responseCode.AUTH.INVAL_AUTH));
    return false;
  }
  User.findOne({ _id: res.locals.uid })
    .select({ _id: 0, name: 1, email: 1, gender: 1, dob: 1 })
    .exec((err, doc) => {
      if (err) {
        res.status(400).json(JSON.stringify(responseCode.AUTH.INVAL_REQ));
      } else if (doc) {
        responseCode.PROFILE.INFO.data = doc;
        res.status("200").json(JSON.stringify(responseCode.PROFILE.INFO.data));
      }
    });
});
router.put("/profile", Authorize.verifyToken, (req, res) => {
  if (!res.locals.authenticated) {
    res.status(403).json(JSON.stringify(responseCode.AUTH.INVAL_AUTH));
    return false;
  }
  User.find({ email: req.body.email, _id: { $ne: res.locals.uid } }).exec(
    (err, doc) => {
      if (err) {
        res.status(400).json(JSON.stringify(responseCode.AUTH.INVAL_REQ));
      } else if (res) {
        if (doc.length > 0) {
          res.status(400).json(JSON.stringify(responseCode.PROFILE.EML_EXIST));
        } else {
          User.updateOne(
            {
              _id: res.locals.uid
            },
            {
              $set: {
                name: req.body.name,
                email: req.body.email,
                dob: req.body.dob,
                gender: req.body.gender
              }
            }
          ).exec((err, update) => {
            if (err) {
              res
                .status(500)
                .json(JSON.stringify(responseCode.PROFILE.SVR_ERR));
            } else if (update) {
              res
                .status("200")
                .json(JSON.stringify(responseCode.PROFILE.UPD_PROFILE));
            }
          });
        }
      }
    }
  );
});
router.put("/change-password", Authorize.verifyToken, (req, res) => {
  if (!res.locals.authenticated) {
    res.status(403).json(JSON.stringify(responseCode.AUTH.INVAL_AUTH));
    return false;
  }
  bcrypt.hash(req.body.newPassword, 10, (err, newPass) => {
    if (err) {
      res.status(400).json(JSON.stringify(responseCode.REGISTER.INVAL_PASS));
    } else {
      User.findOne({
        _id: res.locals.uid
      })
        .select({ _id: 0, password: 1 })
        .exec((err, doc) => {
          if (err) {
            res.status(500).json(JSON.stringify(responseCode.PROFILE.SVR_ERR));
          } else if (doc) {
            bcrypt.compare(
              req.body.currentPassword,
              doc.password,
              (err, matchStatus) => {
                if (err) {
                  res
                    .status(400)
                    .json(JSON.stringify(responseCode.PASSWORD.WNG_PASS));
                } else if (matchStatus) {
                  User.updateOne(
                    {
                      _id: res.locals.uid
                    },
                    {
                      $set: {
                        password: newPass
                      }
                    }
                  ).exec((err, update) => {
                    if (err) {
                      res
                        .status(500)
                        .json(JSON.stringify(responseCode.PROFILE.SVR_ERR));
                    } else if (update) {
                      res
                        .status("200")
                        .json(JSON.stringify(responseCode.PASSWORD.UPD_PASS));
                    }
                  });
                } else {
                  res
                    .status(400)
                    .json(JSON.stringify(responseCode.PASSWORD.WNG_PASS));
                }
              }
            );
          }
        });
    }
  });
});

module.exports = router;
