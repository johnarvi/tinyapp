//returns a boolean depending on user existance
const emailExists = function(users, email) {
  let y = Object.keys(users); let exists = false;
  for (let id of y) {
    if (email === users[id]['email']) {
      exists = true;
    }
  } return exists;
};
//returns an object containing user details
const getIDfromEmail = function(users, email) {
  let y = Object.keys(users);
  for (let id of y) {
    if (email === users[id]['email']) {
      return users[id];
    }
  } return null;
};
//returns an object containing users tiny urls and long urls
const urlsForUser = function(id, Database) {
  let y = Object.keys(Database);
  let userUrls = {};
  for (let i of y) {
    if (id === Database[i]['userID']) {
      userUrls[i] = Database[i].longURL;
    }
  } return userUrls;
};


const generateRandomString = function() {
  let ranStr = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
  return ranStr;
};

module.exports = { emailExists , getIDfromEmail, urlsForUser, generateRandomString };