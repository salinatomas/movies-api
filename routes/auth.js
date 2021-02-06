const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');

const ApiKeysService = require('../services/apiKeys');
const UsersService = require('../services/users');
const { config } = require('../config');

// Basic strategy
require('../utils/auth/strategies/basic');

function authApi(app) {
  const router = express.Router();

  app.use('/api/auth', router);

  const apiKeysService = new ApiKeysService();
  const usersService = new UsersService();

  router.post('/sign-in', async (req, res, next) => {
    const { apiKeyToken } = req.body;

    if (!apiKeyToken) {
      next(boom.unauthorized('apiKeyToken is required'));
    }

    passport.authenticate('basic', (error, user) => {
      // el usuario lo recibimos de nuestra estrategia basic

      try {
        if (error || !user) {
          next(boom.unauthorized()); // el usuario no fue encontrado en nuestra estrategia basic
        }

        req.login(user, { session: false }, async (err) => {
          if (err) {
            next(err);
          }

          const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

          if (!apiKey) {
            next(boom.unauthorized());
          }

          const { _id: id, name, email } = user;

          const payload = {
            sub: {
              id,
              name,
              email,
              scopes: apiKey.scopes,
            },
          };

          const token = jwt.sign(payload, config.authJwtSecret, {
            expiresIn: '15m',
          });

          return res.status(200).json({ token, user: { id, name, email } });
        });
      } catch (err) {
        next(err);
      }
    })(req, res, next);
  });

  router.post('/sign-up', async (req, res, next) => {
    const { body: user } = req;

    try {
      const createdUserId = await usersService.createUser({ user });

      res.status(201).json({
        data: createdUserId,
        message: 'user created',
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/sign-provider', async (req, res, next) => {
    const { body } = req;

    const { apiKeyToken, ...user } = body;

    if (!apiKeyToken) {
      next(boom.unauthorized('apiKeyToken is required'));
    }

    try {
      const queriedUser = await usersService.getOrCreateUser({ user });
      const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

      if (!apiKey) {
        next(boom.unauthorized());
      }

      const { _id: id, name, email } = queriedUser;

      const payload = {
        sub: id,
        name,
        email,
        scopes: apiKey.scopes,
      };

      const token = jwt.sign(payload, config.authJwtSecret, {
        expiresIn: '15m',
      });

      return res.status(200).json({ token, user: { id, name, email } });
    } catch (err) {
      next(err);
    }
  });
}

module.exports = authApi;
