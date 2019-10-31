const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const { emailExists , getIDfromEmail, urlsForUser, generateRandomString } = require('./helpers');
let urlVisits = 0;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key 3', 'key  4']
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3ByGr: { longURL: "https://www.google.ca", userID: "userRandomID" },
  i3ByGd: { longURL: "https://www.lighthouselabs.ca", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "aJ48lW@example.com",
    password: "dish"
  }
};

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let userURLS = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = {
    user: users[req.session.user_id],
    urls: userURLS
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userURLS = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = {
    user: users[req.session.user_id],
    urls: userURLS,
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;
  res.redirect("/urls");
});
// could create a separate page for error pages and a set timeout to redirect back to either login or register page.
app.post("/login", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('<h1>Please fill in the email and password fields</h1><h1><a href="/register">Click me to get back</a></h1>');
  }
  const user = getIDfromEmail(users, req.body.email);
  if (!emailExists(users, req.body.email)) {
    res.status(403).send('<h1>Email does not exist- Please type in a valid email and password</h1><h1><a href="/register">Click me to get back</a></h1>');
  } else if (!bcrypt.compareSync(user.password, hashedPassword)) {
    res.status(403).send('<h1>Incorrect password</h1><h1><a href="/register">Click me to get back</a></h1>');
  } else if (user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});
// sets a cookie
app.get("/login", (req, res) => {
  const user = getIDfromEmail(users, req.body.email);
  if (user) {
    req.session.user_id = user.id;
  }
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(users[req.session.user_id], urlDatabase)

  };
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(users[req.session.user_id], urlDatabase)
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('<h1>Please fill in the email and password fields</h1><h1><a href="/register">Click me to get back</a></h1>');
  }
  if (emailExists(users, req.body.email)) {
    res.status(400).send('<h1>You are already a registered user.</h1><h1><a href="/register">Click me to get back</a></h1>');
  }
  let id = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {}; users[id].id = id;
  users[id].email = req.body.email;
  users[id].password = hashedPassword;
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});
app.get("/logout", (req, res) => {
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let id = users[req.session.user_id];
  let y = Object.keys(urlDatabase);
  if (!req.session.user_id || id.id !== req.session.user_id || req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send('<h1>Do not have edit permissions for this link Or you are not logged in</h1>');
    res.redirect("/urls");
  } else if (req.body.longURL === '') {
    res.status(400).send('<h1>Please fill in the "New URL" field</h1>');
  } else if (req.session.user_id && urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(403).send('URL does not exists');
  }
  for (let sht of y) {
    if (urlDatabase[sht].userID === id.id && sht === req.params.shortURL) {
      urlDatabase[sht].longURL = req.body.longURL;
    }
  }
  res.redirect("/urls");
});

//for testing - curl -X POST -i localhost:8080/urls/b6UTxQ/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let id = users[req.session.user_id];
  let y = Object.keys(urlDatabase);
  if (!req.session.user_id || id.id !== req.session.user_id) {
    res.status(403).send('<h1>Do not have delete permissions for this link</h1>');
    res.redirect("/urls");
  }
  for (let sht of y) {
    if (urlDatabase[sht].userID === id.id && sht === req.params.shortURL) {
      delete urlDatabase[sht];
    }
  }
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  urlVisits++;
  if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlVisits: urlVisits
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send('<h1>Oops. Something went wrong <i>(could be due to the following reasons)</i></h1><h2><li>The"tiny URL" is not valid</li><li>You have not created this link</li><li>You are not logged in</li></h2>');
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(403).send('<h1>This is not a valid "tiny URL"</h1>');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
