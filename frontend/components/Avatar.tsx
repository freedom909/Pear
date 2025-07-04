import React from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  user: {
    name: string;
    avatar?: string;
  };
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 32 }) => {
  const avatarUrl = user?.avatar || '/images/avatar.jpg';
  
  return (
    <div className={styles.avatarContainer}>
      <img
        src={avatarUrl}
        alt={`${user?.name}'s avatar`}
        className={styles.avatarImage}
        style={{
          width: size,
          height: size,
        }}
        onError={(e) => {
          e.currentTarget.src = '/images/default-avatar.png';
        }}
      />
    </div>
  );
};

export default Avatar;