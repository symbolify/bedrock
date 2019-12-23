const express = require('express');
const path = require('path');
const shortid = require('shortid');
const router = express.Router();

const Authorize = require(path.join(__dirname, '../shared', 'authorize.js'));
const Event = require( path.join(__dirname, '../models', 'event.js'));

router.get('/', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    return false;
  }
  Todo.find({user: res.locals.uid})
    .sort('fav')
    .select({createdOn: 0, updatedOn: 0, shorturl: 1, fav: 1})
    .exec((err, todo) => {
      if(err) {
        res.status(500)
          .json({"code": 500, "type": "string", "data": "Internal server error."});
      } else {
        res.status(200)
          .json({"code": 200, "type": "json", "data": todo});
      }
    });
});
router.post('/new', [Authorize.verifyToken, saveTodo], (req, res) => {
  if(!res.locals.authenticated) {
    return false;
  }
  if(res.locals.shorturl != '') {
    res.status(202)
      .json({"code": 202, 
        "type": "json", 
        "data": {
          'title': req.body.title,
          'code': res.locals.shorturl
        }
      });
  }
});
router.post('/:code', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    return false;
  }
  if(req.params.code == '') {
    res.status(400)
      .json({"code": 400, "type": "string", "data": "Invalid request."});
    return false;
  }
  Todo.findOneAndUpdate({"shorturl": req.params.code, "user": res.locals.uid},
    {"$set": {"title": req.body.title, "items": req.body.items}},
    {"new": true})
    .exec((err, updates) => {
      if(err) {
        res.status(400)
          .json({"code": 400, "type": "string", "data": "Invalid request."});
      } else {
        res.status(201)
          .json({"code": 201, "type": "string", "data": "Request submitted successfully."});
      }
    });
});
router.get('/:code', Authorize.verifyToken, (req, res) => {
  if(!res.locals.authenticated) {
    return false;
  }
  if(req.params.code == '') {
    res.status(400)
      .json({"code": 400, "type": "string", "data": "Invalid request."});
    return false;
  }
  Todo.findOne({shorturl: req.params.code, user: res.locals.uid}, (err, todo) => {
    if(err) {
      res.status(400)
        .json({"code": 400, "type": "string", "data": "Invalid request."});
    } else {
      res.status(200)
        .json({"code": 200, 
          "type": "json", 
          "data": {
            title: todo.title,
            items: todo.items
          }
        });
    }
  });
});
function saveTodo(req, res, next) {
  if(!res.locals.authenticated) {
    return false;
  }
  if(typeof req.body.title == 'undefined' || req.body.title == '') {
    res.status(400)
      .json({"code": 400, "type": "string", "data": "Invalid request."});
  } else {
    let shortCode = shortid.generate();
    new Event({
      shorturl: shortCode,
      organizer: res.locals.uid,
      title: req.body.title,
      type: req.body.type,
      
    }).save((err, doc) => {
      if(err){
        if(err.code == 11000) {
          saveTodo(req, res, next);
        } else {
          res.status(500)
            .json({"code": 500, "type": "string", "data": "Internal server error."});
        }
      } else if(doc) {
        res.locals.shorturl = shortCode;
        next();
      }
    });
  }
}

module.exports = router;