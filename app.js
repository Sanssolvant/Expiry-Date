'use strict';
const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const cors = require('cors');
const passport = require('passport');
const initPassport = require('./passport-config');
const flash = require('express-flash');
const session = require('express-session');
const app = express();

// Checks the username and the password TODO user.username sowie user.id muss von datenbank kommen
initPassport(
  passport,
  username => users.find(user => user.username === username),
  id => users.find(user => user.id === id)
);

dotenv.config();

const users = [];
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

// Set Engine Configs
app.set('view engine', 'ejs');

// Static Files
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Api Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  })
);

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

app.post(
  '/index',
  passport.authenticate('local', {
    successRedirect: '/list',
    failureRedirect: '/index',
    failureFlash: true,
  })
  // let sql = `SELECT * FROM members WHERE id = ${1}`;
  // db.query(sql, (err, result) => {
  //   if (err) {
  //     throw err;
  //   }
  //   let data = JSON.parse(JSON.stringify(result));
  //   console.log(data[0].m_email);
  // });
);

app.post('/register', async (req, res) => {
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
    console.log('nicht geklappt');
  }
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

app.listen('4000', () => {
  console.log('Server started on port 4000');
});
