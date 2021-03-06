// eslint-disable-next-line
global.absoluteRequire = name => require(`${__dirname}/app/${name}`);

const express = require('express');
const setupApp = absoluteRequire('setup');
const app = express();

setupApp(app);

modules.export = app;