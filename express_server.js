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

const urlsForUser = function(id) {
  let y = Object.keys(urlDatabase);
  let userUrls = {};
  for (let i of y) {
    if (id === urlDatabase[i]['userID']) {
      userUrls[i] = urlDatabase[i].longURL;
    }
  } return userUrls;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let userURLS = urlsForUser(req.cookies['user_id']);
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: userURLS
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userURLS = urlsForUser(req.cookies['user_id']);
  let templateVars = {
    user: users[req.cookies['user_id']],
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
  //console.log(req.body);  Log the POST request body to the console
  // let userURLS = urlsForUser(req.cookies['user_id']);
  // let templateVars = {
  //   user: users[req.cookies['user_id']],
  //   urls: userURLS
  // };
  // console.log(templateVars);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.cookies['user_id'];
  // console.log(req.body);
  res.redirect("/urls");
});

// could create a separate page for error pages and a set timeout to redirect back to either login or register page.
app.post("/login", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please fill in the email and password fields');
  }
  const user = lookID(users, req.body.email);
  if (!emailExists(users, req.body.email)) {
    res.status(403).send('Email does not exist- Please type in a valid email and password');
  } else if (user.password !== req.body.password) {
    res.status(403).send('Incorrect password');
  } else if (user) {
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => { // sets a cookie
  console.log(req.body);
  const user = lookID(users, req.body.email);
  if (user) {
    res.cookie('user_id', user.id);
  }
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlsForUser(users[req.cookies['user_id']])

  };
  res.render("urls_login", templateVars);
});


app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlsForUser(users[req.cookies['user_id']])
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please fill in the email and password fields');
  }
  if (emailExists(users, req.body.email)) {
    res.status(400).send('You are already a registered user');
  }
  let id = generateRandomString();
  users[id] = {}; users[id].id = id;
  users[id].email = req.body.email;
  users[id].password = req.body.password;
  res.cookie('user_id', users[id]['id']);
  res.redirect("/urls");
  console.log(users);
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let id = users[req.cookies['user_id']];
  let y = Object.keys(urlDatabase);
  for (let sht of y) {
    if (urlDatabase[sht].userID === id.id && sht === req.params.shortURL) {
      urlDatabase[sht].longURL = req.body.longURL;
    }
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let id = users[req.cookies['user_id']];
  let y = Object.keys(urlDatabase);
  for (let sht of y) {
    if (urlDatabase[sht].userID === id.id && sht === req.params.shortURL) {
      delete urlDatabase[sht];
    } else {
      console.log("not a user");
    }
  }
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
