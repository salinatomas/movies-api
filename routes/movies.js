const express = require('express');
const { moviesMock } = require('../utils/mocks/movies');

const moviesApi = (app) => {
  const router = express.Router();

  app.use('/api/movies', router);

  router.get('/', async (req, res, next) => {
    try {
      const movies = await Promise.resolve(moviesMock);

      res.status(200).json({
        data: movies,
        message: 'Movies list',
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:movieId', async (req, res, next) => {
    try {
      const movie = await Promise.resolve(moviesMock[0]);

      res.status(200).json({
        data: movie,
        message: 'Movies retrieved',
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const createdMovieId = await Promise.resolve(moviesMock[0].id);

      res.status(201).json({
        data: createdMovieId,
        message: 'Movie created',
      });
    } catch (err) {
      next(err);
    }
  });

  router.put('/:movieId', async (req, res, next) => {
    try {
      const updatedMovieId = await Promise.resolve(moviesMock[0].id);

      res.status(200).json({
        data: updatedMovieId,
        message: 'Movie updated',
      });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:movieId', async (req, res, next) => {
    try {
      const deletedMovieId = await Promise.resolve(moviesMock[0].id);

      res.status(200).json({
        data: deletedMovieId,
        message: 'Movie deleted',
      });
    } catch (err) {
      next(err);
    }
  });
};

module.exports = moviesApi;
