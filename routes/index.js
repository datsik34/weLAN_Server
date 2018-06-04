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

let userSchema = mongoose.Schema({
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
  usersModel = mongoose.model('users', userSchema),
  eventSchema = mongoose.Schema({
    "creation_date": Date,
    "author": { // informations relatives à l'organisateur
      "id": String, // id de l'organisateur
      "username": String, // username de l'organisateur
      "email": String, // email de l'organisateur
      "phone": String // numéro de téléphone de l'organisateur
    },
    "platforms": String, // pc ou console
    "games": [String], // jeux sélectionnés
    "dates": { // dates de l'event
      "start": Date, // date début
      "end": Date // date fin
    },
    "location": String, // localisation de l'event (type incertain)
    "info": { // info relatives à l'event
      "event_name": String, // nom de l'event
      "description": String, // description de l'event
      "participants": { // infos relatives aux participants
        "quantity": { // nombre de participants
          "max": Number // nombre maximum
        },
        "members": [
          {
            user_id: String,
            username: String,
            description: String,
            phone: String
          }
        ] // liste des membres
      },
      "age": { // age de participation à l'event
        "min": Number, // age minimum
        "max": Number // age maximum
      },
      "skill": Number, // niveau de jeu
      "smoking": Boolean // event fumeur ou non fumeur
    }
  }),
  eventsModel = mongoose.model('event', eventSchema);

hash = password => crypto.createHash('sha256').update(`${password}a1d0c6e83f027327d8461063f4ac58a6`).digest('base64').toString();

/* SignUp */
router.post('/signup', (req, res, next) => {
  let user = new usersModel({
    username: req.body.username,
    email: req.body.email,
    password: hash(req.body.password),
    birthday: req.body.birthday,
    firstname: null,
    lastname: null,
    description: 'Description préremplie',
    phone: '0812345678',
    address: null
  });

  /* Check age */
  /* 410248800000 = 13 ans */
  if (Date.now() - req.body.birthday > 410248800000) {
    user.save((err, user) => {
      if (err) {
        return res.json({success: false, err});
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
  usersModel.findOne({
    email: req.body.email,
    password: hash(req.body.password)
  }, (err, user) => {
    if (user && user.email === req.body.email && user.password === hash(req.body.password)) {
      res.json({success: true, user});
    } else {
      res.json({success: false, err});
    }
  });
});

router.post('/profile', (req, res, next) => {
  let eventList = [];
  /* Grab les infos de l'utilisateur */
  usersModel.find({
    _id: req.body._id
  }, (err, user) => {
    if (user) {
      /* Check si l'utilisateur en question est inscrit dans des events */
      eventsModel.find({}, (err, event) => {
        event.map(e => {
          /* Check si il y a des participants dans l'event */
          if (e.info.participants.members.length > 0) {
            e.info.participants.members.map(el => {
              /* check si l'id de l'utilisateur est présent dans l'event */
              if (el.user_id == req.body._id) {
                eventList.push(e);
              }
            });
          }
        });
      }).then(() => {
        if (eventList.length > 0) {
          return res.json({success: true, user, eventList});
        } else {
          return res.json({success: true, user, err, message: `${eventList.length} in coming events found`});
        }
      });
    } else {
      return res.json({success: false, err, message: 'blablabla'});
    }
  });
});

router.post('/upload', (req, res, next) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  /* check de l'id utilisateur */
  if (req.body._id) {
    usersModel.findOne({
      _id: req.body._id
    }, (err, user) => {
      if (user) {
        let sampleFile = req.files.avatar;

        /* rename et place l'image envoyée */
        sampleFile.mv(`./public/images/avatar/${req.body._id}.jpg`, error => {
          if (error) {
            return res.status(500).send(error);
          }
          return res.status(200).send({success: true});
        });
      } else {
        return res.status(400).send({err, success: false, message: 'User not found.'})
      }
    });
  } else {
    return res.status(400).send({error: 'Incorrect _id.'});
  }
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
  propsArray.map(
    e => user[e] = e === 'password'
    ? hash(req.body[e])
    : req.body[e]);

  usersModel.update({
    _id: req.body._id
  }, user, err => res.json({success: true, user}));
});

router.post('/event/organize', (req, res, next) => {
  let event = new eventsModel({
    "creation_date": Date.now(),
    "author": {
      // informations relatives à l'organisateur
      "id": req.body.author.id
        ? req.body.author.id
        : null, // id de l'organisateur
      "username": req.body.author.username
        ? req.body.author.username
        : null, // username de l'organisateur
      "email": req.body.author.email
        ? req.body.author.email
        : null, // email de l'organisateur
      "phone": req.body.author.phone
        ? req.body.author.phone
        : null // numéro de téléphone de l'organisateur
    },
    "platforms": req.body.platforms
      ? req.body.platforms
      : null, // pc ou console
    "games": [req.body.games]
      ? [req.body.games]
      : [null], // jeux sélectionnés
    "dates": {
      // dates de l'event
      "start": req.body.dates.start
        ? req.body.dates.start
        : null, // date début
      "end": req.body.dates.end
        ? req.body.dates.end
        : null // date fin
    },
    "location": req.body.location
      ? req.body.location
      : null, // localisation de l'event (type incertain)
    "info": {
      // info relatives à l'event
      "event_name": req.body.info.event_name
        ? req.body.info.event_name
        : null, // nom de l'event
      "description": req.body.info.description
        ? req.body.info.description
        : null, // description de l'event
      "participants": { // infos relatives aux participants
        "quantity": {
          // nombre de participants
          "max": req.body.info.participants.quantity.max
            ? req.body.info.participants.quantity.max
            : null, // nombre maximum
        }
      },
      "age": {
        // age de participation à l'event
        "min": req.body.info.age.min
          ? req.body.info.age.min
          : null, // age minimum
        "max": req.body.info.age.max
          ? req.body.info.age.max
          : null // age maximum
      },
      "skill": req.body.info.skill
        ? req.body.info.skill
        : null, // niveau de jeu
      "smoking": req.body.info.smoking
        ? req.body.info.smoking
        : false // event fumeur ou non fumeur
    }
  });

  usersModel.find({
    _id: req.body.author.id
  }, (err) => {
    if (!err && req.body.author.id) {
      event.save((err, event) => { // sauvegarde de l'event
        if (err) {
          return res.json({success: false, err: err});
        }
        return res.json({success: true, event});
      });
    } else {
      return res.json({success: false, err: err});
    }
  });
});

router.post('/event/participate', (req, res, next) => {
  /* Recherche de "soi-même" afin d'envoyer nos infos à la DB event */
  usersModel.findOne({
    _id: req.body.user_id
  }, (err, user) => {
    if (!err && user) {
      let newMembers = {
        user_id: user._id,
        username: user.username,
        description: user.description,
        phone: user.phone
      }
      if (user.description && user.phone) {
        /* Recherche de l'event correspondant à l'ID renseigné pour le modifier */
        eventsModel.findOne({
          _id: req.body._id
        }, (err, event) => {
          /* Check de la présence de l'utilisateur dans la liste des membres */
          if (event.info.participants.members.length < event.info.participants.quantity.max) {
            let nbPresence = 0;
            for (let e of event.info.participants.members) {
              if (e.user_id == user._id) {
                nbPresence++;
              }
            }
            /* si l'utilisateur n'est pas déjà présent, on l'ajoute */
            if (nbPresence < 1) {
              eventsModel.update({
                _id: req.body._id
              }, {
                $push: {
                  'info.participants.members': newMembers
                }
              }, (err, event) => {
                if (!err) {
                  return res.json({success: true, event});
                }
              });
            } else {
              return res.json({success: false, err, message: 'You\'re currently registered in this event'});
            }
          } else {
            return res.json({success: false, err, message: 'Can\'t join this event, maximum participants quantity reached'});
          }
        });
      } else {
        return res.json({success: false, err, message: 'Please, enter a description and a phone number before to register to an event'});
      }
    } else {
      return res.json({succes: false, err, message: 'test'});
    }
  });
});

/* Return toutes les lans à venir */
router.get('/event/locate', (req, res, next) => {
  // let array = ['start', 'end'];  ligne à switch sur le front
  eventsModel.find({}, (err, event) => {
    let availableEvent = [];
    event.map(e => {
      if (e.dates.start > Date.now() && e.info.participants.members.length < e.info.participants.quantity.max) {
        /* début de l'élément à switch sur le front //
        let elements = {
          start: null,
          end: null
        }
        for (let el of array) {
          elements[el] = JSON.stringify(e.dates[el]).slice(1, -1).split(/"|-|T|:/);
          elements[el] = `${elements[el][2]}.${elements[el][1]}.${elements[el][0]} - ${elements[el][3]}h${elements[el][4]}`;
        }
        console.log(elements);
        // fin de l'élément à switch */
        availableEvent.push(e);
      }
    });
    return res.json({success: true, results: 'in_coming_events', availableEvent});
  });
});

module.exports = router;
