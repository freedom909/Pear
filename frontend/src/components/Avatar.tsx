//frontend/components/Avatar
import React from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  user: {
    _id?: string;
    username?: {
      firstname?: string;
      lastname?: string;
    };
    name?: string;
    avatar?: string;
  };
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 32, className = '' }) => {
  // Construct proper avatar URL
  const getAvatarUrl = () => {
    if (user?.avatar) {
      // Handle both relative and absolute URLs
      return user.avatar.startsWith('http') ? 
        user.avatar : 
        `${process.env.NEXT_PUBLIC_API_URL || ''}${user.avatar}`;
    }
    return '/images/default-avatar.png';
  };

  // Get user's display name
  const getDisplayName = () => {
    if (user?.username) {
      return `${user.username.firstname || ''} ${user.username.lastname || ''}`.trim();
    }
    return user?.name || 'User';
  };

  const avatarUrl = getAvatarUrl();
  const displayName = getDisplayName();

  return (
    <div className={`${styles.avatarContainer} ${className}`}>
      <img
        src={avatarUrl}
        alt={`${displayName}'s avatar`}
        className={styles.avatarImage}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
        }}
        onError={(e) => {
          e.currentTarget.src = '/images/default-avatar.png';
          e.currentTarget.onerror = null; // Prevent infinite loop
        }}
      />
    </div>
  );
};

export default Avatar;