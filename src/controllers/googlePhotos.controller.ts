import { Request, Response } from 'express';
import { GooglePhotosService } from '../services/googlePhotos.service.js';
import { UserDocument } from '../models/User.js';

/**
 * GET /api/google/photos/albums
 * Get user's Google Photos albums
 */
export const getAlbums = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    
    if (!user.google?.tokens?.accessToken) {
      return res.status(401).json({ 
        error: 'Not connected to Google Photos',
        message: 'Please connect your Google account with Photos permissions'
      });
    }

    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 50;
    const pageToken = req.query.pageToken as string | undefined;
    
    const photosService = new GooglePhotosService(user);
    const result = await photosService.getAlbums(pageSize, pageToken);
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching Google Photos albums:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch albums',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/google/photos/mediaItems
 * Get user's Google Photos media items (photos and videos)
 */
export const getMediaItems = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    
    if (!user.google?.tokens?.accessToken) {
      return res.status(401).json({ 
        error: 'Not connected to Google Photos',
        message: 'Please connect your Google account with Photos permissions'
      });
    }

    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 50;
    const pageToken = req.query.pageToken as string | undefined;
    const albumId = req.query.albumId as string | undefined;
    
    const photosService = new GooglePhotosService(user);
    const result = await photosService.getMediaItems(pageSize, pageToken, albumId);
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching Google Photos media items:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch media items',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/google/photos/mediaItems/:id
 * Get a specific Google Photos media item by ID
 */
export const getMediaItem = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    const mediaItemId = req.params.id;
    
    if (!user.google?.tokens?.accessToken) {
      return res.status(401).json({ 
        error: 'Not connected to Google Photos',
        message: 'Please connect your Google account with Photos permissions'
      });
    }
    
    const photosService = new GooglePhotosService(user);
    const mediaItem = await photosService.getMediaItem(mediaItemId);
    
    return res.json(mediaItem);
  } catch (error) {
    console.error('Error fetching Google Photos media item:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch media item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/google/photos/albums/:id
 * Get a specific Google Photos album by ID
 */
export const getAlbum = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    const albumId = req.params.id;
    
    if (!user.google?.tokens?.accessToken) {
      return res.status(401).json({ 
        error: 'Not connected to Google Photos',
        message: 'Please connect your Google account with Photos permissions'
      });
    }
    
    const photosService = new GooglePhotosService(user);
    const album = await photosService.getAlbum(albumId);
    
    return res.json(album);
  } catch (error) {
    console.error('Error fetching Google Photos album:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch album',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  getAlbums,
  getMediaItems,
  getMediaItem,
  getAlbum
  };