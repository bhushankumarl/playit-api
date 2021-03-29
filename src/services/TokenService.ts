import * as express from 'express';
import { IRequest } from '../interface/IRequest';
import * as Debug from 'debug';
import * as Boom from 'boom';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { TokenEntity } from '../entities/TokenEntity';
import { getMongoRepository } from 'typeorm';

const debug = Debug('PL:TokenService');

/**
 * Insert token
 * @param: id
 * @param: token
 * @param: timestamp
 * @param: userId
 * @param: type
 */
export const createToken: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (_.isEmpty(req.userStore)) {
    return next(Boom.notFound('User does not exists.'));
  }
  let loginToken = '';
  try {
    loginToken = uuidv4();
  } catch (exception) {
    debug('createToken Exception %o ', exception);
  }
  try {
    const token: TokenEntity = new TokenEntity();
    token.token = loginToken;
    token.timestamp = new Date();
    token.user = {
      _id: req.userStore._id
    };
    const tokenModel = getMongoRepository(TokenEntity);
    req.tokenStore = await tokenModel.save(token);
    return next();
  } catch (error) {
    debug('createToken error ', error);
    return next(error);
  }
};

/**
 * Search Token
 */
export const searchOneByToken: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.headers['authorization']) {
    return next();
  }
  const SPACE = ' ';
  const authorization = req.headers['authorization'].split(SPACE);
  if (authorization.length < 1) {
    return next();
  }
  try {
    const tokenModel = getMongoRepository(TokenEntity);
    const whereCondition = {
      token: authorization[1]
    };
    req.tokenStore = await tokenModel.findOne(whereCondition);
  } catch (error) {
    return next(error);
  }
  return next();
};

/**
 * Delete token by Id
 */
export const deleteTokenById: express.RequestHandler = async (req: IRequest, res: express.Response, next: express.NextFunction) => {
  const tokenStore = req.tokenStore;
  if (_.isEmpty(tokenStore)) {
    return next();
  }
  try {
    const tokenModel = getMongoRepository(TokenEntity);

    const whereCondition = {
      _id: tokenStore._id
    };
    await tokenModel.deleteOne(whereCondition);
  } catch (error) {
    return next(error);
  }
  return next();
};
