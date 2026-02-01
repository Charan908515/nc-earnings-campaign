# 🔐 New Secure Secrets Generated

**IMPORTANT**: Use these in your Railway environment variables

## Generated Secrets

### JWT Secret
```
JWT_SECRET=ac7df84335640a0f9d29ac1edaa01867cfbc607caebc39c30657c24467f3bd071a3a71541ed78a6ba383f16dd4846b0bcb1a03cac405c6b156831124fe820e7d
```

### Postback Secret
```
POSTBACK_SECRET=11682c4fa743bb393d12c69b07045fddf1d56bb869c988c1d3beb41713441e854787588b9bb3f703f8e1aeb6208b9b2d8d30464798a34a7def52a32bc1064003
```

## Railway Setup Instructions

1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add/Update these environment variables:

```bash
NODE_ENV=production
JWT_SECRET=ac7df84335640a0f9d29ac1edaa01867cfbc607caebc39c30657c24467f3bd071a3a71541ed78a6ba383f16dd4846b0bcb1a03cac405c6b156831124fe820e7d
POSTBACK_SECRET=11682c4fa743bb393d12c69b07045fddf1d56bb869c988c1d3beb41713441e854787588b9bb3f703f8e1aeb6208b9b2d8d30464798a34a7def52a32bc1064003
ALLOWED_ORIGINS=https://nc-earnings-campaign-production.up.railway.app
```

5. Keep your existing variables:
   - MONGO_URI
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
   - TELEGRAM_USER_BOT_TOKEN
   - TELEGRAM_ADMIN_BOT_TOKEN
   - TELEGRAM_ADMIN_CHAT_ID

6. Click "Deploy" to apply changes

## ⚠️ Security Notes

- **Never commit these secrets to git**
- **Delete your local .env file** after moving to Railway
- These secrets are cryptographically random (128 characters each)
- Change ADMIN_PASSWORD to a strong password as well
