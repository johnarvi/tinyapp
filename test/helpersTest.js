const { assert } = require('chai');

const { lookID, emailExists, generateRandomString } = require('../helpers.js');

const testUsers = {
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

describe('email generating/ testing functions and random string generator', function() {
  it('should return a user with valid email', function() {
    const user = lookID(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });

  it('should return a user object with valid email', function() {
    const user = lookID(testUsers, "user@example.com");
    const expectedOutput = testUsers["userRandomID"];
    assert.deepEqual(user, expectedOutput);
  });

  it('should return null with an invalid email', function() {
    const user = lookID(testUsers, "user3@example.com");
    const expectedOutput = null;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined with an invalid email', function() {
    const user = lookID(testUsers, "user3@example.com");
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });

  it('should return false with an invalid email', function() {
    const user = emailExists(testUsers, "user3@example.com");
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });

  it('should return true if a user with valid email exists', function() {
    const user = emailExists(testUsers, "user@example.com");
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });

  it('should return a random string', function() {
    const strType = typeof(generateRandomString());
    const expectedOutput = 'string';
    assert.equal(strType, expectedOutput);
  });

  it('should return a random string of length 6', function() {
    const strType = (generateRandomString());
    const expectedOutput = 6;
    assert.equal(strType.length, expectedOutput);
  });
});
