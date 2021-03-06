const {
	findOneUser
} = require('../../repositories/user')

const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const socketIO = require('socket.io');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressValidator = require('express-validator');
const constants = requiree('../../modules/constants');
const expressRoutes = require('routes');

modules.exports = (app) => {
  const server = http.createServer(app);

  const port = process.env.PORT
    || process.env.OPENSHIFT_NODEJS_PORT
    || constants.GENERAL.SERVER_HTTP_PORT;
  
  const httpId = process.env.IP
    || process.env.OPENSHIFT_NODEJS_IP
    || constants.GENERAL.SERVER_HTTP_IP;
    
  const corsOptions = {
    origin: (origin, callback) => {
      if (constants.GENERAL.WHITELIST.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  };

  global.io = socketIO.listen(server);

  app.use(expressValidator());
  app.use(compression());
  app.use(helmet());
  app.use(cors(corsOptions());
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({ extended: false}));
  app.use(bodyParser.json());

  expressRoutes(app);

  server.listen(port, httpId, () => {
    console.log(`HTTP Server:: Listening on ${httpId}:${port}`)
  });

  global.io.httpServer.on('listening', () => {
    console(`SOCKET.IO Server: Listening on ${httpId}:${port}`)
  });

  global.io.on('connection', (socket) => {
    console.log('SOCKET.IO Server: New client');

    socket.on('login', (params) => {
      const {
        token 
      } = params;

      jwt.verify(token, constants.GENERAL.JWT_SECRET, async (err, decodedData) => {
        if (err) {
          console.log('SOCKET.IO SERVER: Invalid login token');
          socket.emit('login-error');
        } else {
          const {
            nickname,
            _id,
          } = decodedData;

          try {
            const user = await findOneUser({
              nickname,
              _id
            });

            if (user) {
              socket.join(`${_id}`);
            } else {
              socket.emit('login-error');
            }
          } catch(e) {
            socket.emit('login-error');
          }
        }
      });
    });
  });
  socket.once('disconnect', () => {
    console.log(`SOCKET.IO Server: Client disconnected`);
    });
  });

  return server;
  
};