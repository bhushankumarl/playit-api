import * as Debug from 'debug';
import * as _ from 'lodash';
import * as Boom from 'boom';
import * as moment from 'moment';
import * as passportHttpBearer from 'passport-http-bearer';
import { TokenEntity } from '../../entities/TokenEntity';
import { UserEntity } from '../../entities/UserEntity';
import { getRepository } from 'typeorm';
import { IRequest } from '../../interface/IRequest';

const debug = Debug('PL:Passport');
const bearerStrategy = passportHttpBearer.Strategy;

export const passport = new bearerStrategy({
  scope: '',
  realm: '',
  passReqToCallback: true
}, async (req: IRequest, token: string, callback: any) => {
  // debug('Inside bearerStrategy');
  let tokenDocument: TokenEntity;
  let userDocument: UserEntity;

  try {
    // debug('token ', token);
    const whereCondition = {
      token: token
    };
    const tokenModel = getRepository(TokenEntity);
    tokenDocument = await tokenModel.findOne(whereCondition);
  } catch (error) {
    debug('Error %o ', error);
    return callback(error);
  }
  if (_.isEmpty(tokenDocument)) {
    return callback(new Boom('You are unauthorized User.'), { statusCode: 401 });
  } else if (_.isEmpty(tokenDocument.userId)) {
    return callback(new Boom('You are unauthorized User.'), { statusCode: 401 });
  }
  try {
    const searchCondition = {
      id: tokenDocument.userId
    };
    const userModel = getRepository(UserEntity);
    userDocument = await userModel.findOne(searchCondition);
    // debug('userDocument ', userDocument);
  } catch (error) {
    debug('Error %o ', error);
    return callback(error);
  }
  const expiryTimestamp: any = moment(tokenDocument.timestamp).add(365, 'days');
  const isAfter: boolean = moment(expiryTimestamp).isAfter(moment().format());

  if (isAfter === false) {
    return callback(new Boom('Your session has been expired.'), { statusCode: 401 });
  }
  req.userStore = userDocument;
  // debug('req.userStore ', req.userStore);
  return callback(undefined, userDocument);
});
