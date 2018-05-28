const router = require('express').Router();
const mongoose = require('mongoose');
const crypto = require('crypto');

const options = {
  server: {
    socketOptions: {
      connectTimeoutMS: 5000
    }
  }
};

mongoose.connect('mongodb://roem:azerty@ds237610.mlab.com:37610/welan', options, err => {
  if (err) {
    console.log(err);
  }
});

let usersSchema = mongoose.Schema({
    id: String,
    username: String,
    email: String,
    password: String,
    birthday: Date,
    firstname: String,
    lastname: String,
    description: String,
    phone: String,
    address: String
  }),
  usersModel = mongoose.model('users', usersSchema);

hash = (password) => crypto.createHash('sha256').update(`${password}a1d0c6e83f027327d8461063f4ac58a6`).digest('base64').toString();

/* SignUp */
router.post('/signup', (req, res, next) => {
  let user = new usersModel({
    username: req.body.username,
    email: req.body.email,
    password: hash(req.body.password),
    birthday: req.body.birthday,
    firstname: null,
    lastname: null,
    description: null,
    phone: null,
    address: null
  });

  /* Check age */
  if (Date.now() - req.body.birthday > 420227200000) {
    user.save((err, user) => {
      if (err) {
        return res.json({success: false, error: err});
      }
      return res.json({success: true, user});
    });
  } else {
    return res.json({
      success: false,
      error: parseInt((Date.now() - req.body.birthday) / 86400000 / 365)
    });
  }
});

/* Login */
router.post('/login', (req, res, next) => {
  usersModel.find({
    email: req.body.email,
    password: hash(req.body.password)
  }, (err, user) => {
    return res.json({success: true, user});
  });
});

/* Update */
router.post('/update', (req, res, next) => {
  let user = {},
    /* table de propriétés */
    propsArray = [
      'username',
      'email',
      'password',
      'birthday',
      'firstname',
      'lastname',
      'description',
      'phone',
      'address'
    ];

  /* map sur les props pour checker si il faut modifier des valeurs */
  propsArray.map(e => {
    if (req.body[e]) {
      return user[e] = req.body[e];
    }
  });

  usersModel.update({
    _id: req.body._id
  }, user, (err) => {
    return res.json({success: true, user});
  });
});

module.exports = router;
