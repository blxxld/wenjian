// ==================== 收藏管理模块 ====================

import { StorageUtil } from './utils.js';

export const FavoriteManager = {
    getFavorites() {
        return StorageUtil.get('favorites', []);
    },
    
    isResourceFavorited(resourceId) {
        const favorites = this.getFavorites();
        return favorites.includes(resourceId.toString());
    },
    
    toggleFavorite(resourceId) {
        const favorites = this.getFavorites();
        const resourceIdStr = resourceId.toString();
        
        if (favorites.includes(resourceIdStr)) {
            // 移除收藏
            const index = favorites.indexOf(resourceIdStr);
            favorites.splice(index, 1);
        } else {
            // 添加收藏
            favorites.push(resourceIdStr);
        }
        
        StorageUtil.set('favorites', favorites);
    }
};
