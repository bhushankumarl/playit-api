import * as express from 'express';
import * as passport from 'passport';
import * as UserService from '../services/UserService';
import * as GoogleService from '../services/GoogleService';
import * as TokenService from '../services/TokenService';
import * as UserController from '../controllers/UserController';
import * as GoogleController from '../controllers/GoogleController';

const userRoute: express.Router = express.Router();

/**
 * Register API : It will generate Google oAuth URL
 */
userRoute.get('/register', [
  UserService.searchOneByEmail,
  GoogleService.generatesAuthUrlForRegister,
  GoogleController.googleDetail
]);

/**
 * This API Will be call by Google oAuth
 */
userRoute.get('/register/oauth/callback', [
  GoogleService.retrieveAuthorizationCode,
  GoogleService.retrieveGoogleProfileFromOAuth2,
  UserService.searchOneByGoogleEmailAddress,
  UserService.registerUser,
  // UserService.searchOneByState,
  UserService.updateGoogleToken,
  TokenService.createToken,
  GoogleController.redirectToHome
]);

/**
 * Retrieve ME Detail
 */
userRoute.get('/me', passport.authenticate('bearer'), [
  UserController.userDetail
]);

/**
 * Retrieve Google Profile
 */
userRoute.post('/google/me', passport.authenticate('bearer'), [
  GoogleService.retrieveGoogleProfile,
  GoogleController.googleProfileDetail
]);

/**
 * Login
 */
userRoute.get('/login', [
  GoogleService.generatesAuthUrlForRegister,
  GoogleController.redirectToOAuth
]);

/**
 * User logout
 */
userRoute.delete('/logout', passport.authenticate('bearer'), [
  TokenService.searchOneByToken,
  TokenService.deleteTokenById,
  UserController.logout
]);

export { userRoute };
