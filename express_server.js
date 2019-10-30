const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); //parses data into humanreadable
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const generateRandomString = function() {
  let ranStr = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
  return ranStr;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
};

const emailExists = function(users, email) {
  let y = Object.keys(users); let exists = false;
  for (let id of y) {
    if (email === users[id]['email']) {
      exists = true;
    }
  } return exists;
};

const lookID = function(users, email) {
  let y = Object.keys(users);
  for (let id of y) {
    if (email === users[id]['email']) {
      return users[id];
    }
  } return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => { // sets a cookie
  console.log(req.body);
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please fill in the email and password fields');
  }
  const user = lookID(users, req.body.email);
  if (user) {
    res.cookie('user_id', user.id);
  }
  res.redirect("/urls");
  console.log(users);
});

app.get("/login", (req, res) => { // sets a cookie
  console.log(req.body);
  const user = lookID(users, req.body.email);
  if (user) {
    res.cookie('user_id', user.id);
  }
  let templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  // res.render("urls_index", templateVars);
  res.render("urls_login", templateVars);
});


app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please fill in the email and password fields');
  }
  if (emailExists(users, req.body.email)) {
    res.status(400).send('You are already a registered user');
  }
  let id = generateRandomString();
  users[id] = {};
  users[id].id = id;
  users[id].email = req.body.email;
  users[id].password = req.body.password;
  res.cookie('user_id', users[id]['id']);
  res.redirect("/urls");
  console.log(users);
});


app.post("/logout", (req, res) => {
  console.log(req.body);
  res.clearCookie('user_id');
  // res.render("urls_index", templateVars);
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  console.log(req.body);
  let templateVars = { urls: urlDatabase };
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log('reached', req.params.shortURL);
  // let templateVars = { urls: urlDatabase };
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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
