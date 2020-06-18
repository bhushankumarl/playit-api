import * as express from 'express';
import * as passport from 'passport';
import * as UserService from '../services/UserService';
import * as PlaylistService from '../services/PlaylistService';
import * as MediaItemService from '../services/MediaItemService';
import * as PlaylistController from '../controllers/PlaylistController';
import * as MediaItemController from '../controllers/MediaItemController';

const playlistRoute: express.Router = express.Router();

/**
 * Add Audio Playlist or Add Video Playlist
 * This API can be call to add the YouTube playlist.
 * Once Playlist added it will download the Media Files into the Google Drive
 */
playlistRoute.post('/', [
    PlaylistService.validateNewPlaylist,
    UserService.searchOneByEmail,
    PlaylistService.searchOneByPlaylistUrlIdAndUserId,
    PlaylistService.addPlaylist,
    PlaylistController.playlist
]);

/**
 * Remove Audio Playlist or Remove Video Playlist
 */
playlistRoute.delete('/', [
    PlaylistService.validateNewPlaylist,
    UserService.searchOneByEmail,
    PlaylistService.searchOneByPlaylistUrlIdAndUserId,
    PlaylistService.removePlaylist,
    PlaylistController.playlist
]);

/**
 * Search All Playlist
 * This API will return all the Playlist of the User
 */
playlistRoute.post('/search', passport.authenticate('bearer'), [
    PlaylistService.searchAllPlaylist,
    PlaylistController.playlistData
]);

/**
 * Search All Playlist
 * This API will return all the Playlist of the User
 */
playlistRoute.post('/search/:playlistId', passport.authenticate('bearer'), [
    PlaylistService.searchOneByPlaylistIdAndUserId,
    MediaItemService.searchByLoggedInUserPlaylistAndDriveFolderId,
    MediaItemController.mediaItemData
]);

export { playlistRoute };
