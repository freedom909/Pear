import axios from 'axios';
import { UserDocument } from '../models/User.js';

/**
 * Google Photos API 服务类
 * 用于与 Google Photos API 交互，获取相册和媒体项信息
 */
export class GooglePhotosService {
  private accessToken: string;
  private readonly baseUrl = 'https://photoslibrary.googleapis.com/v1';
  
  /**
   * 从用户对象创建 GooglePhotosService 实例
   * @param user 用户对象
   * @returns GooglePhotosService 实例
   */
  public static fromUser(user: UserDocument): GooglePhotosService {
    // 从用户的 tokens 数组中获取 Google 访问令牌
    const googleToken = user.tokens && 
      Array.isArray(user.tokens) && 
      user.tokens.find(token => token.kind === 'google');
    
    if (!user.google || !googleToken || !googleToken.accessToken) {
      throw new Error('用户未连接 Google 账号或缺少访问令牌');
    }
    
    return new GooglePhotosService(googleToken.accessToken);
  }
  
  /**
   * 构造函数
   * @param accessToken Google OAuth 访问令牌
   */
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  
  /**
   * 获取用户的相册列表
   * @param pageSize 每页返回的相册数量，默认为 50
   * @param pageToken 分页令牌，用于获取下一页结果
   * @returns 相册列表
   */
  public async getAlbums(pageSize = 50, pageToken?: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/albums`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          pageSize,
          pageToken
        }
      });
      
      const albums = response.data.albums || [];
      
      // 如果有下一页，递归获取
      if (response.data.nextPageToken) {
        const nextAlbums = await this.getAlbums(pageSize, response.data.nextPageToken);
        return [...albums, ...nextAlbums];
      }
      
      return albums;
    } catch (error) {
      console.error('获取 Google Photos 相册失败:', error);
      throw new Error('获取相册列表失败');
    }
  }
  
  /**
   * 获取单个相册信息
   * @param albumId 相册 ID
   * @returns 相册信息
   */
  public async getAlbum(albumId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/albums/${albumId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`获取相册 ${albumId} 信息失败:`, error);
      throw new Error('获取相册信息失败');
    }
  }
  
  /**
   * 获取相册中的媒体项
   * @param albumId 相册 ID
   * @param pageSize 每页返回的媒体项数量，默认为 100
   * @param pageToken 分页令牌，用于获取下一页结果
   * @returns 媒体项列表
   */
  public async getMediaItemsInAlbum(albumId: string, pageSize = 100, pageToken?: string): Promise<any[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/mediaItems:search`, {
        albumId,
        pageSize,
        pageToken
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const mediaItems = response.data.mediaItems || [];
      
      // 如果有下一页，递归获取
      if (response.data.nextPageToken) {
        const nextMediaItems = await this.getMediaItemsInAlbum(albumId, pageSize, response.data.nextPageToken);
        return [...mediaItems, ...nextMediaItems];
      }
      
      return mediaItems;
    } catch (error) {
      console.error(`获取相册 ${albumId} 中的媒体项失败:`, error);
      throw new Error('获取相册媒体项失败');
    }
  }
  
  /**
   * 获取单个媒体项信息
   * @param mediaItemId 媒体项 ID
   * @returns 媒体项信息
   */
  public async getMediaItem(mediaItemId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/mediaItems/${mediaItemId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`获取媒体项 ${mediaItemId} 信息失败:`, error);
      throw new Error('获取媒体项信息失败');
    }
  }
}