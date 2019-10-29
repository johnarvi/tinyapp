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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
    , urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let templateVars = {
    username: req.cookies["username"]
    , urls: urlDatabase
  };
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body);
  res.cookie('username', req.body.username);
  // res.render("urls_index", templateVars);
  res.redirect("/urls");

});

app.post("/urls/:shortURL", (req, res) => {
  console.log(req.body);
  let templateVars = {
    username: req.cookies["username"]
    , urls: urlDatabase
  };
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
    username: req.cookies["username"],
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
