import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  Paper,
  styled,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  Person,
} from '@mui/icons-material';

const UploadBox = styled(Paper)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
    transform: 'translateY(-2px)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  marginBottom: theme.spacing(1),
  border: `3px solid ${theme.palette.primary.main}`,
  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

interface AvatarUploadProps {
  value?: string | null;
  onChange: (avatarUrl: string | null) => void;
  error?: string;
  disabled?: boolean;
}

// Helper function to compress images
const compressImage = (file: File, options: {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: string;
}): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > options.maxWidth) {
        width = options.maxWidth;
        height = width / aspectRatio;
      }
      if (height > options.maxHeight) {
        height = options.maxHeight;
        width = height * aspectRatio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${options.format}`,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        `image/${options.format}`,
        options.quality
      );
    };

    img.onerror = () => reject(new Error('Image loading failed'));
    img.src = URL.createObjectURL(file);
  });
};

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Compress and resize image before converting to base64
      const compressedFile = await compressImage(file, {
        maxWidth: 100,
        maxHeight: 100,
        quality: 0.6,
        format: 'jpeg'
      });

      // Convert compressed file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        console.log('[AvatarUpload] Base64 size:', base64String.length, 'characters');
        
        // Since you have LONGTEXT in the database, we can send the full base64
        onChange(base64String);
        setUploading(false);
      };
      reader.onerror = () => {
        console.error('[AvatarUpload] File reading failed');
        alert('Failed to process avatar file');
        setUploading(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Avatar processing error:', error);
      alert('Failed to process avatar');
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBoxClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      <UploadBox onClick={handleBoxClick} elevation={0}>
        {value ? (
          <>
            <StyledAvatar src={value} alt="Avatar preview">
              <Person />
            </StyledAvatar>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBoxClick();
                }}
                disabled={disabled || uploading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAvatar();
                }}
                disabled={disabled || uploading}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </>
        ) : (
          <>
            {uploading ? (
              <CircularProgress />
            ) : (
              <>
                <StyledAvatar>
                  <PhotoCamera />
                </StyledAvatar>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  {disabled 
                    ? 'Avatar upload disabled' 
                    : 'Click to upload avatar'
                  }
                </Typography>
              </>
            )}
          </>
        )}
      </UploadBox>
      
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default AvatarUpload;
