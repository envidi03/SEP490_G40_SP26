const Account = require('../modules/auth/models/Account.model');
const User = require('../modules/auth/models/User.model');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../common/errors');