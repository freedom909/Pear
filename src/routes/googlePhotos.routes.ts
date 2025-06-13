import express from 'express';
import { GooglePhotosService } from '../services/googlePhotos.service';

const router = express.Router();

/**
 * GET /api/google/photos/albums
 * 获取用户的相册列表
 */
router.get('/albums', async (req, res, next) => {
  try {
    const googlePhotosService = GooglePhotosService.fromUser(req.user);
    const albums = await googlePhotosService.getAlbums();
    
    res.json({
      success: true,
      data: albums
    });
  } catch (error) {
    console.error('获取 Google Photos 相册失败:', error);
    next(error);
  }
});

/**
 * GET /api/google/photos/albums/:albumId
 * 获取单个相册信息
 */
router.get('/albums/:albumId', async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const googlePhotosService = GooglePhotosService.fromUser(req.user);
    const album = await googlePhotosService.getAlbum(albumId);
    
    res.json({
      success: true,
      data: album
    });
  } catch (error) {
    console.error('获取相册信息失败:', error);
    next(error);
  }
});

/**
 * GET /api/google/photos/albums/:albumId/mediaItems
 * 获取相册中的媒体项
 */
router.get('/albums/:albumId/mediaItems', async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const googlePhotosService = GooglePhotosService.fromUser(req.user);
    const mediaItems = await googlePhotosService.getMediaItemsInAlbum(albumId);
    
    res.json({
      success: true,
      data: mediaItems
    });
  } catch (error) {
    console.error('获取相册媒体项失败:', error);
    next(error);
  }
});

/**
 * GET /api/google/photos/mediaItems/:mediaItemId
 * 获取单个媒体项信息
 */
router.get('/mediaItems/:mediaItemId', async (req, res, next) => {
  try {
    const { mediaItemId } = req.params;
    const googlePhotosService = GooglePhotosService.fromUser(req.user);
    const mediaItem = await googlePhotosService.getMediaItem(mediaItemId);
    
    res.json({
      success: true,
      data: mediaItem
    });
  } catch (error) {
    console.error('获取媒体项信息失败:', error);
    next(error);
  }
});

export default router;