# RotoWrite Deployment Guide

## Prerequisites

Before deploying RotoWrite, ensure you have:

1. A Supabase project set up (see `supabase/SETUP.md`)
2. API keys for:
   - Grok (for AI content generation)
   - OpenAI (for embeddings)
   - Tavily (for news search)
3. A Vercel account

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
GROK_API_KEY=your_grok_api_key
OPENAI_API_KEY=your_openai_api_key

# News Service
TAVILY_API_KEY=your_tavily_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:5309
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up your `.env.local` file with the required environment variables

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:5309](http://localhost:5309)

## Database Setup

Follow the instructions in `supabase/SETUP.md` to:

1. Create your Supabase project
2. Run the migrations
3. Enable pgvector extension
4. Create your first admin user

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/verygooddesigners/rotowrite)

### Manual Deployment

1. Push your code to GitHub

2. Connect your repository to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

3. Configure Environment Variables in Vercel:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from your `.env.local` file
   - **Important**: Update `NEXT_PUBLIC_APP_URL` to your Vercel domain

4. Deploy:
   - Vercel will automatically deploy on push to main branch
   - Or click "Deploy" manually

## Post-Deployment Checklist

- [ ] Verify Supabase connection works
- [ ] Test user authentication
- [ ] Create first admin user
- [ ] Test Writer Factory (add training content)
- [ ] Test Brief Builder
- [ ] Test Project Creation workflow
- [ ] Test content generation with Grok
- [ ] Test NewsEngine with Tavily
- [ ] Test SEO Assistant
- [ ] Verify Admin Dashboard access

## Production Considerations

### Security

1. **API Keys**: Never commit API keys to version control
2. **Supabase RLS**: Ensure Row Level Security policies are enabled
3. **Admin Access**: Only create admin accounts for trusted users
4. **HTTPS**: Vercel provides HTTPS automatically

### Performance

1. **Caching**: Consider implementing caching for news searches
2. **Rate Limiting**: Implement rate limiting for AI generation endpoints
3. **Database Indexes**: Already configured in migrations
4. **Vector Search**: pgvector is optimized for similarity search

### Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Supabase Logs**: Monitor database performance
3. **Error Tracking**: Consider adding Sentry or similar
4. **API Usage**: Monitor Grok, OpenAI, and Tavily usage

## Troubleshooting

### Common Issues

**Issue**: "Unauthorized" errors
- **Solution**: Check Supabase environment variables
- Verify user session is valid
- Check RLS policies in Supabase

**Issue**: Content generation not working
- **Solution**: Verify Grok API key is correct
- Check API key hasn't exceeded rate limits
- Review Vercel function logs

**Issue**: NewsEngine returning no results
- **Solution**: Verify Tavily API key
- Check API quota hasn't been exceeded
- Test with different keywords

**Issue**: Vector search not finding similar content
- **Solution**: Ensure pgvector extension is enabled
- Verify embeddings are being generated
- Check OpenAI API key is valid

## Updating the Application

1. Make changes locally
2. Test thoroughly on localhost:5309
3. Commit and push to GitHub
4. Vercel will automatically deploy
5. Monitor deployment logs
6. Test production deployment

## Scaling

As your usage grows:

1. **Supabase**: Upgrade to Pro plan for more connections
2. **Vercel**: Upgrade for increased function execution time
3. **API Services**: Upgrade Grok/OpenAI/Tavily plans as needed
4. **Database**: Consider connection pooling with Supavisor

## Support

For issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Test API endpoints individually
4. Verify environment variables

## Backup Strategy

1. **Database**: Supabase provides automatic backups
2. **Content**: Projects are stored in database
3. **Writer Models**: Training content backed up in database
4. **Configuration**: Environment variables documented

Regular backups are handled by Supabase automatically on Pro plan.


