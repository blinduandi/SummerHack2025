import React from 'react';
import {
  Card,
  CardContent,
  styled,
  alpha,
} from '@mui/material';
import type { CardProps } from '@mui/material';

interface AuthCardProps extends CardProps {
  children: React.ReactNode;
}

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  width: '100%',
  padding: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  boxShadow: theme.shadows[8],
}));

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  ...props
}) => {
  return (
    <StyledCard {...props}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {children}
      </CardContent>
    </StyledCard>
  );
};

export default AuthCard;
