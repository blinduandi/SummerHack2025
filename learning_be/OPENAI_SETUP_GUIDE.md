# OpenAI Integration Setup Guide

This guide will help you set up the OpenAI integration for the Learning Platform chat system.

## Prerequisites

1. OpenAI account with API access
2. Valid OpenAI API key
3. Laravel application properly configured

## Step 1: Get Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account (or create one)
3. Navigate to "API Keys" section
4. Click "Create new secret key"
5. Copy the generated key (starts with `sk-`)

## Step 2: Configure Environment Variables

Add the following to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

**Important Notes:**
- Replace `sk-your-actual-api-key-here` with your actual OpenAI API key
- Keep your API key secure and never commit it to version control
- `gpt-3.5-turbo` is the cheapest OpenAI model available

## Step 3: Test the Integration

Use the built-in test command to verify everything works:

```bash
php artisan test:openai "Hello, I need help with JavaScript"
```

If successful, you should see:
- The test message you sent
- A response from OpenAI
- Token usage information

If you see an error about the API key not being configured, double-check your `.env` file.

## Step 4: Clear Configuration Cache

If you've made changes to the configuration:

```bash
php artisan config:clear
```

## Cost Management

The integration is configured for cost efficiency:

### Current Settings
- **Model**: `gpt-3.5-turbo` (cheapest option)
- **Max Tokens**: 500 per response
- **Temperature**: 0.7 (balanced creativity)

### Estimated Costs (as of June 2025)
- Input: $0.0015 per 1K tokens
- Output: $0.002 per 1K tokens
- Average response: ~200 tokens = ~$0.0004 per chat message

### Cost Optimization Tips
1. **Monitor Usage**: Check your OpenAI dashboard regularly
2. **Set Billing Limits**: Configure spending limits in OpenAI dashboard
3. **Fallback System**: The system automatically falls back to rule-based responses if OpenAI fails
4. **Token Limits**: Responses are limited to 500 tokens to control costs

## Troubleshooting

### "OpenAI API key not configured"
- Check that `OPENAI_API_KEY` is set in your `.env` file
- Ensure there are no extra spaces around the key
- Run `php artisan config:clear`

### "Authentication failed"
- Verify your API key is correct and active
- Check that your OpenAI account has API access
- Ensure you have sufficient credits in your OpenAI account

### "Rate limit exceeded"
- You've hit OpenAI's rate limits
- Wait a few minutes before trying again
- Consider upgrading your OpenAI plan for higher limits

### Responses are too generic
- The system includes context from courses and user progress
- Make sure users are enrolled in courses for better context
- Consider adjusting the system prompts in the ChatController

## Fallback System

If OpenAI is unavailable or fails, the system automatically provides:
1. Rule-based responses for common questions
2. Helpful debugging tips for error messages
3. Course-specific guidance when possible
4. General learning encouragement and tips

This ensures users always get some form of assistance, even if AI is temporarily unavailable.

## Security Considerations

1. **API Key Security**: Never expose your OpenAI API key in client-side code
2. **Rate Limiting**: Implement rate limiting for chat endpoints
3. **Input Validation**: All user inputs are validated before sending to OpenAI
4. **Content Filtering**: Consider implementing content filtering for inappropriate requests
5. **Logging**: API errors are logged for monitoring and debugging

## Production Deployment

For production deployment:

1. Set `OPENAI_API_KEY` in your production environment
2. Monitor usage and costs in OpenAI dashboard
3. Set up alerts for unusual usage patterns
4. Consider implementing caching for similar questions
5. Monitor error rates and fallback usage

## Support

If you encounter issues:

1. Check the Laravel logs: `storage/logs/laravel.log`
2. Test the integration: `php artisan test:openai`
3. Verify OpenAI account status and credits
4. Review the troubleshooting section above

The integration is designed to be robust and cost-effective while providing excellent educational assistance to your users.
