// imports
const express = require('express');
const morgan = require('morgan');
const {check, validationResult} = require('express-validator'); // validation middleware
const dao = require('./dao');
const Task = require('./task');
const path = require('path');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session');

// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
    function(username, password, done) {
      dao.getUser(username, password).then(({user, check}) => {
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!check) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      })
    }
  ));
  
  // serialize and de-serialize the user (user object <-> session)
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    dao.getUserById(id).then(user => {
      done(null, user);
    });
  });

// init express
const app = express(); 
const port = 3000;

// set-up logging
app.use(morgan('tiny'));

// check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    return res.status(401).json({"statusCode" : 401, "message" : "not authenticated"});
  }

// process body content as JSON
app.use(express.json());

// set up the 'client' component as a static website
app.use(express.static('client'));

// set up the session
app.use(session({
    secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
    resave: false,
    saveUninitialized: false 
  }));
  
  // init passport
  app.use(passport.initialize());
  app.use(passport.session());

// === REST API endpoints ===/

// GET /tasks
app.get('/api/tasks', isLoggedIn, (req, res) => {
    dao.getTasks(req.query.filter, req.user.id)
        .then((tasks) => res.json(tasks) )
        .catch((err) => {
            res.status(500).json({
                errors: [{'msg': err}],
             });
       });
});

// GET /tasks/<taskId>
app.get('/api/tasks/:taskId', isLoggedIn, (req, res) => {
    dao.getTask(req.params.taskId, req.user.id)
        .then((task) => {
            if(task.error){
                res.status(404).json(task);
            } else {
                res.json(task);
            }
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{'param': 'Server', 'msg': err}],
            });
        });
});

// POST /tasks
app.post('/api/tasks', isLoggedIn, [
    check('description').notEmpty(),
  ], (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    const task = req.body;
    task.userId = req.user.id;
    dao.addTask(task)
        .then((id) => res.status(201).header('Location', `/tasks/${id}`).end())
        .catch((err) => res.status(503).json({ error: err }));
    
});

// PUT /tasks/<taskId>
app.put('/api/tasks/:taskId', isLoggedIn, [
    check('description').notEmpty(),
  ], (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    const task = req.body;
    task.userId = req.user.id;
    dao.updateTask(req.params.taskId, task)
        .then((result) => {
            if(result)
                res.status(404).json(result);
            else
                res.status(200).end();
        })
        .catch((err) => res.status(500).json({
            errors: [{'param': 'Server', 'msg': err}],
        }));
});

// DELETE /tasks/<taskId>
app.delete('/api/tasks/:taskId', isLoggedIn, (req,res) => {
    dao.deleteTask(req.params.taskId, req.user.id)
        .then((result) =>  {
            if(result)
                res.status(404).json(result);
            else
             res.status(204).end();
        })
        .catch((err) => res.status(500).json({
            errors: [{'param': 'Server', 'msg': err}],
        }));
});

// POST /sessions 
// Login
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, function(err) {
          if (err) { return next(err); }
          // req.user contains the authenticated user
          return res.json(req.user.username);
        });
    })(req, res, next);
  });

// All the other requests will be served by our client-side app
app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, 'client/index.html'));
  });


// activate server
app.listen(port, () => console.log('Server ready'));
