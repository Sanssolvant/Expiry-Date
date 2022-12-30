'use strict';
const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const cors = require('cors');
const passport = require('passport');
const flash = require('express-flash');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const parseurl = require('parseurl');
let session = require('express-session');
let MySQLStore = require('express-mysql-session')(session);
dotenv.config();

// Create Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.USEDATABASE,
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySql Connected...');
});

// Static Files
// Api Middleware
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new MySQLStore({
      host: 'localhost',
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      port: process.env.PORT_DB,
      database: process.env.USEDATABASE,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  })
);

// Set Engine Configs
app.set('view engine', 'ejs');

const customFields = {
  usernameField: 'username',
  passwordField: 'password',
};

const verifyCallback = (username, password, done) => {
  db.query('Select * from members where m_username = ?', [username], async function (error, results) {
    if (error) {
      return done(error);
    }
    if (results.length == 0) {
      return done(null, false);
    }
    let user = { id: results[0].id, username: results[0].m_username, password: results[0].m_password };
    try {
      if (await bcrypt.compare(password, results[0].m_password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid Username or Password!' });
      }
    } catch (e) {
      return done(e);
    }
  });
};

const strategy = new LocalStrategy(customFields, verifyCallback);
passport.use(strategy);

passport.serializeUser((user, done) => {
  console.log('inside serialize');
  done(null, user.id);
});

passport.deserializeUser(function (userId, done) {
  console.log('deserializeUser ' + userId);
  db.query('Select * from members where id = ?', [userId], function (error, results) {
    done(null, results[0]);
  });
});

// function isAuth(req, res, next) {
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     res.redirect('/notAuthorized');
//   }
// }

// API Routes
app.get('/index', (req, res) => {
  res.render('index.ejs');
});

app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.get('/list', (req, res) => {
  res.render('list.ejs');
});

app.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/index');
  });
});

app.post(
  '/index',
  passport.authenticate('local', {
    successRedirect: '/list',
    failureRedirect: '/index',
    failureFlash: true,
  })
);

function userExists(req, res, next) {
  db.query('Select * from members where m_username = ?', [req.body.username], function (error, results, fields) {
    if (error) {
      console.log('Error');
    } else if (results.length > 0) {
      //TODO SEND A MESSAGE THA AN USER ALREADY EXISTS
      res.render('register.ejs', {
        ualex: 'User already exists',
      });
    } else {
      next();
    }
  });
}

app.post('/register', userExists, async (req, res) => {
  if (req.body.password === req.body.conpassword) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      let post = {
        m_username: req.body.username,
        m_email: req.body.email,
        m_password: hashedPassword,
      };
      let sql = 'INSERT INTO members SET ?';
      db.query(sql, post, (err, result) => {
        if (err) {
          throw err;
        }
        console.log(result);
        res.redirect('/index');
      });
    } catch {
      res.status(500).send();
    }
  } else {
    res.redirect('/register');
  }
});

// Truncate products: Delets all rows and reset ID
app.post('/truncate', (req, res) => {
  let sql = 'TRUNCATE products';
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('Truncate successful');
  });
});

// Insert products
app.post('/insert', (req, res) => {
  console.log(req.body); // The data in body of request
  let post = {
    p_image: req.body.image,
    p_name: req.body.name,
    p_quantity: req.body.quantity,
    p_expirydate: req.body.expirydate,
  };
  let sql = 'INSERT INTO products SET ?';
  db.query(sql, post, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('Product Insert successful...');
  });
});

// Insert members
app.post('/insertMember', async (req, res) => {
  console.log(req.body); // The data in body of request
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    let post = {
      m_username: req.body.username,
      m_email: req.body.email,
      m_password: hashedPassword,
    };
    let sql = 'INSERT INTO members SET ?';
    db.query(sql, post, (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      res.redirect('/index');
    });
  } catch {
    res.redirect('/register');
    res.status(500).send();
  }
});

// Select single post
app.get('/selectmembers/:id', (req, res) => {
  let sql = `SELECT * FROM members WHERE id = ${req.params.id}`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let data = JSON.parse(JSON.stringify(result));
    console.log(data[0].m_email);
  });
});

// Create DB
app.get('/createdb', (req, res) => {
  let sql = 'CREATE DATABASE produkte_ADate ';
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('Database created...');
  });
});

// Create Table
app.get('/createtable', (req, res) => {
  let sql =
    'CREATE TABLE products(id int AUTO_INCREMENT, p_image BLOB, p_name VARCHAR(255), p_quantity int, p_expirydate date, PRIMARY KEY (id))';

  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('Table created...');
  });
});

// Update post
app.get('/updateproduct/:id', (req, res) => {
  let newName = 'Brot';
  let sql = `UPDATE products SET p_name = '${newName}' WHERE id = ${req.params.id}`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('Product update successful...');
  });
});

//Delete post
app.get('/deleteproduct/:id', (req, res) => {
  let sql = `DELETE FROM products WHERE id = ${req.params.id}`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('Product delete successful...');
  });
});

app.listen(process.env.PORT, () => {
  console.log('Server started on port ' + process.env.PORT);
});
