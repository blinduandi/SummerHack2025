import React from 'react';
import { Avatar } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { getInitials } from './index';
import type { User } from '../types';

interface UserAvatarProps {
  user: User | null;
  size?: number;
  showInitials?: boolean;
  sx?: SxProps<Theme>;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Consistent user avatar component that shows avatar image if available,
 * otherwise falls back to user initials
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 40,
  showInitials = true,
  sx,
  className,
  onClick,
}) => {  if (!user) {
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          ...sx
        }}
        className={className}
        onClick={onClick}
      >
        ?
      </Avatar>
    );
  }

  return (
    <Avatar
      src={user.avatar || undefined}
      sx={{
        width: size,
        height: size,
        ...sx
      }}
      className={className}
      onClick={onClick}
    >
      {!user.avatar && showInitials && getInitials(user.name)}
    </Avatar>
  );
};

export default UserAvatar;
