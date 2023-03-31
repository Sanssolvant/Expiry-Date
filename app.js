'use strict';
const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const cors = require('cors');
const passport = require('passport');
const flash = require('express-flash');
const LocalStrategy = require('passport-local').Strategy;
const moment = require('moment');
const app = express();
let session = require('express-session');
let MySQLStore = require('express-mysql-session')(session);
let date;
dotenv.config();

const sessionName = 'sid';

// Create Database connection
/* const db = mysql.createConnection({
  host: '127.0.0.1',
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.USEDATABASE,
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySql Connected...');
}); */

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
    name: sessionName,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'lax',
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
    let user = { id: results[0].id };
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

// API Routes
app.get('/index', (req, res) => {
  res.render('index.ejs');
});

app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.get('/list', (req, res) => {
  let data = JSON.parse(JSON.stringify(req.session));
  let sql = `SELECT * FROM products WHERE m_id = ${data.passport.user}`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let fromDB = JSON.parse(JSON.stringify(result));
    console.log(fromDB);
    date = moment().format('YYYY-MM-DD');
    res.render('list.ejs', {
      dataList: fromDB,
      date: date,
    });
  });
});

app.get('/sortproductup', (req, res) => {
  let data = JSON.parse(JSON.stringify(req.session));
  let sql = `SELECT * FROM products WHERE m_id = ${data.passport.user} ORDER BY p_name`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let fromDB = JSON.parse(JSON.stringify(result));
    res.render('listwithoutausgabe.ejs', {
      dataList: fromDB,
    });
  });
});

app.get('/sortproductdown', (req, res) => {
  let data = JSON.parse(JSON.stringify(req.session));
  let sql = `SELECT * FROM products WHERE m_id = ${data.passport.user} ORDER BY p_name DESC`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let fromDB = JSON.parse(JSON.stringify(result));
    res.render('listwithoutausgabe.ejs', {
      dataList: fromDB,
    });
  });
});

app.get('/sortquantitytup', (req, res) => {
  let data = JSON.parse(JSON.stringify(req.session));
  let sql = `SELECT * FROM products WHERE m_id = ${data.passport.user} ORDER BY p_quantity`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let fromDB = JSON.parse(JSON.stringify(result));
    res.render('listwithoutausgabe.ejs', {
      dataList: fromDB,
    });
  });
});

app.get('/sortquantitydown', (req, res) => {
  let data = JSON.parse(JSON.stringify(req.session));
  let sql = `SELECT * FROM products WHERE m_id = ${data.passport.user} ORDER BY p_quantity DESC`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let fromDB = JSON.parse(JSON.stringify(result));
    res.render('listwithoutausgabe.ejs', {
      dataList: fromDB,
    });
  });
});

app.get('/sortdateup', (req, res) => {
  let data = JSON.parse(JSON.stringify(req.session));
  let sql = `SELECT * FROM products WHERE m_id = ${data.passport.user} ORDER BY p_expirydate`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let fromDB = JSON.parse(JSON.stringify(result));
    res.render('listwithoutausgabe.ejs', {
      dataList: fromDB,
    });
  });
});

app.get('/sortdatedown', (req, res) => {
  let data = JSON.parse(JSON.stringify(req.session));
  let sql = `SELECT * FROM products WHERE m_id = ${data.passport.user} ORDER BY p_expirydate DESC`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let fromDB = JSON.parse(JSON.stringify(result));
    res.render('listwithoutausgabe.ejs', {
      dataList: fromDB,
    });
  });
});

app.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy();
    res.clearCookie(sessionName);
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
      res.render('register.ejs', {
        uAlEx: 'User already exists',
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
        res.redirect('/index');
      });
    } catch {
      res.status(500).send();
    }
  } else {
    res.redirect('/register');
  }
});

//Delete products
app.post('/deleteproducts', (req, res) => {
  let data = JSON.parse(JSON.stringify(req.session));
  let sql = `DELETE FROM products WHERE m_id = ${data.passport.user}`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('Product delete successful...');
  });
});

// Insert products
app.post('/insert', (req, res) => {
  let data = JSON.parse(JSON.stringify(req.session));
  console.log(req.body); // The data in body of request
  let post = {
    m_id: data.passport.user,
    /*     p_photo: req.body.photo, */
    p_name: req.body.name,
    p_quantity: req.body.quantity,
    p_measure: req.body.measure,
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

app.listen(process.env.PORT, () => {
  console.log('Server started on port ' + process.env.PORT);
});

// // Select single post
// app.get('/selectmembers/:id', (req, res) => {
//   let sql = `SELECT * FROM members WHERE id = ${req.params.id}`;
//   db.query(sql, (err, result) => {
//     if (err) {
//       throw err;
//     }
//     let data = JSON.parse(JSON.stringify(result));
//     console.log(data[0].m_email);
//   });
// });

// // Truncate products: Delets all rows and reset ID
// app.post('/truncate', (req, res) => {
//   let sql = 'TRUNCATE products';
//   db.query(sql, (err, result) => {
//     if (err) {
//       throw err;
//     }
//     console.log(result);
//     res.send('Truncate successful');
//   });
// });

// // Create DB
// app.get('/createdb', (req, res) => {
//   let sql = 'CREATE DATABASE produkte_ADate ';
//   db.query(sql, (err, result) => {
//     if (err) {
//       throw err;
//     }
//     console.log(result);
//     res.send('Database created...');
//   });
// });

// // Create Table
// app.get('/createtable', (req, res) => {
//   let sql =
//     'CREATE TABLE products(id int AUTO_INCREMENT, p_image BLOB, p_name VARCHAR(255), p_quantity int, p_expirydate date, PRIMARY KEY (id))';

//   db.query(sql, (err, result) => {
//     if (err) {
//       throw err;
//     }
//     console.log(result);
//     res.send('Table created...');
//   });
// });

// // Update post
// app.get('/updateproduct/:id', (req, res) => {
//   let newName = 'Brot';
//   let sql = `UPDATE products SET p_name = '${newName}' WHERE id = ${req.params.id}`;
//   db.query(sql, (err, result) => {
//     if (err) {
//       throw err;
//     }
//     console.log(result);
//     res.send('Product update successful...');
//   });
// });
