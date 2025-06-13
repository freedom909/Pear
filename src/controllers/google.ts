import { Request, Response, NextFunction } from 'express';
import { hasConnectedGoogle, initiateGoogleAuthentication, handleGoogleCallback, unlinkGoogle } from '../config/google.passport';
import { GooglePhotosService } from '../services/googlePhotos.service';

/**
 * GET /google/photos
 * Google Photos page - 显示用户的相册列表
 */
export const getGooglePhotos = async (req: Request, res: Response, next: NextFunction) => {
  if (!hasConnectedGoogle(req.user)) {
    req.flash('errors', ['请先连接您的 Google 账号。']);
    return res.redirect('/account');
  }
  
  try {
    const googlePhotosService = GooglePhotosService.fromUser(req.user);
    const albums = await googlePhotosService.getAlbums();
    
    res.render('googlePhotos', {
      title: 'Google 相册',
      albums: albums
    });
  } catch (error) {
    console.error('Error fetching Google Photos albums:', error);
    req.flash('errors', ['获取 Google 相册失败，请稍后再试。']);
    return next(error);
  }
};

/**
 * GET /google/photos/:albumId
 * Google Photos Album page - 显示特定相册中的照片
 */
export const getGooglePhotoAlbum = async (req: Request, res: Response, next: NextFunction) => {
  if (!hasConnectedGoogle(req.user)) {
    req.flash('errors', ['请先连接您的 Google 账号。']);
    return res.redirect('/account');
  }
  
  try {
    const { albumId } = req.params;
    const googlePhotosService = GooglePhotosService.fromUser(req.user);
    
    // 获取相册信息
    const album = await googlePhotosService.getAlbum(albumId);
    
    // 获取相册中的媒体项
    const mediaItems = await googlePhotosService.getMediaItemsInAlbum(albumId);
    
    res.render('googlePhotoAlbum', {
      title: album.title || 'Google 相册',
      album: album,
      mediaItems: mediaItems
    });
  } catch (error) {
    console.error('Error fetching Google Photos album:', error);
    req.flash('errors', ['获取相册内容失败，请稍后再试。']);
    return next(error);
  }
};

/**
 * GET /auth/google
 * Google authentication page.
 */
export const getGoogle = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/google', {
    title: 'Google Account'
  });
};

/**
 * GET /auth/google/login
 * Initiate Google OAuth login flow
 */
export const googleLogin = (req: Request, res: Response, next: NextFunction) => {
  initiateGoogleAuthentication(req, res, next);
};

/**
 * GET /auth/google/callback
 * Handle Google OAuth callback after login
 */
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  handleGoogleCallback(req, res, next);
};

/**
 * GET /auth/google/connect
 * Connect Google account to existing user account
 */
export const googleConnect = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    req.flash('errors', { msg: 'You must be logged in to connect Google account.' });
    return res.redirect('/login');
  }
  initiateGoogleAuthentication(req, res, next);
};

/**
 * GET /auth/google/connect/callback
 * Handle callback for Google account connection
 */
export const googleConnectCallback = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    req.flash('errors', { msg: 'You must be logged in to connect Google account.' });
    return res.redirect('/login');
  }
  handleGoogleCallback(req, res, next);
};

/**
 * GET /auth/google/unlink
 * Unlink Google account from user account
 */
export const googleUnlink = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    req.flash('errors', { msg: 'You must be logged in to unlink Google account.' });
    return res.redirect('/login');
  }
  
  try {
    await unlinkGoogle(req, res, next);
  } catch (error) {
    console.error('Error unlinking Google account:', error);
    req.flash('errors', { msg: 'Failed to unlink Google account.' });
    res.redirect('/account');
  }
};