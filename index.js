/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-expressions */
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;
const sessionName = 'sid';
const sessionSecret = 'ultimate secret';

// TODO: Use actual DB
// TODO: Encrypt password
const users = [
  {
    id: 1, name: 'peter', email: 'peter@abc.com', password: 'abc'
  },
  {
    id: 2, name: 'alan', email: 'alan@abc.com', password: 'abc'
  },
  {
    id: 3, name: 'bob', email: 'bob@abc.com', password: 'abc'
  }
];

const app = express();

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
};

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/home');
  } else {
    next();
  }
};

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  name: sessionName,
  resave: false,
  saveUninitialized: false,
  secret: sessionSecret,
  cookie: {
    maxAge: 1000 * 30,
    sameSite: true
  }
}));

app.get('/', (req, res) => {
  const { userId } = req.session;
  res.send(
    `
  <h1>Welcome!</h1>
  ${userId ? `
  <a href="/home">Home</a>
  <form method="POST" action="/logout">
  <button>Logout</button>
  </form>
  ` : `
  <a href="/login">Login</a>
  <a href="/register">Register</a>
  `}
  `
  );
});

app.get('/home', redirectLogin, (req, res) => {
  const user = users.find((element) => element.id === req.session.userId);
  res.send(
    `
    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
      <li>Name: ${user.name}</li>
      <li>Email: ${user.email}</Li>
    <ul>
    <form method='post' action='/logout'>
      <input type="submit" value="Logout"/>
    </form>
    `
  );
});

app.get('/login', redirectHome, (req, res) => {
  res.send(
    `
    <h1>Login</h1>
    <form method='post' action='/login'>
      <input type='email' name='email' placeholder="Email" required/>
      <input type='password' name='password' placeholder="Password" required/>
      <input type="submit"/>
    </form>
    <a href='/register'>Register</a>
    `
  );
});

app.get('/register', redirectHome, (req, res) => {
  res.send(
    `
    <h1>Register</h1>
      <form method='post' action='/register'>
        <input name='name' placeholder="Name" required/>
        <input type='email' name='email' placeholder="Email" required/>
        <input type='password' name='password' placeholder="Password" required/>
        <input type="submit"/>
      </form>
      <a href='/login'>Login</a>
    `
  );
});

app.post('/login', redirectHome, (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const user = users.find((element) => element.email === email && element.password === password);
    if (user) {
      req.session.userId = user.id;
      return res.redirect('/home');
    }
  }
  res.redirect('/login');
});

app.post('/register', redirectHome, (req, res) => {
  const { name, email, password } = req.body;
  if (email && name && password) {
    const isUserExist = users.some((element) => element.email === email);
    if (!isUserExist) {
      const user = {
        id: users.length + 1,
        name,
        email,
        password
      };
      users.push(user);
      req.session.userId = user.id;
      return res.redirect('/home');
    }
  }
  return res.redirect('/register');
});

app.post('/logout', redirectLogin, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.redirect('/home');
    }
    res.clearCookie(sessionName);
    res.redirect('/login');
  });
});

app.listen(port, () => {
  console.log('Server is listening on port: ', port);
});
