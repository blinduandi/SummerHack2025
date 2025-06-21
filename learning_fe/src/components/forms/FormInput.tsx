import React from 'react';
import {
  TextField,
  styled,
  alpha,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface FormInputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
    },
  },
}));

export const FormInput: React.FC<FormInputProps> = ({
  variant = 'outlined',
  fullWidth = true,
  margin = 'normal',
  ...props
}) => {
  return (
    <StyledTextField
      variant={variant}
      fullWidth={fullWidth}
      margin={margin}
      {...props}
    />
  );
};

export default FormInput;
