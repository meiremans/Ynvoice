const defaultConfig = require('./default');

defaultConfig.port = process.env.PORT || defaultConfig.port;

defaultConfig.mongo.server = process.env.MONGO_SERVER || defaultConfig.mongo.server;
defaultConfig.mongo.database = process.env.MONGO_DB || defaultConfig.mongo.database;
defaultConfig.mongo.port = process.env.MONGO_PORT || defaultConfig.mongo.port;

defaultConfig.jwt.expiresIn = process.env.JWT_EXPIRESIN || defaultConfig.jwt.expiresIn;
defaultConfig.jwt.JWT_SECRET = process.env.JWT_SECRET || defaultConfig.jwt.JWT_SECRET;


module.exports = defaultConfig;
