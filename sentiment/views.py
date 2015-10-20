import datetime
import os
from django.shortcuts import redirect
from django.views.generic import View
from django.http import JsonResponse
from django.contrib.contenttypes.models import ContentType
from twython import Twython
import feedparser
from sentiment.alchemyapi import AlchemyAPI
from sentiment.models import Sentiment, Tweet, Keyword, Profile
import sentiment.helper as help 
# Create your views here.

class YahooArticleListView(View):
    # site = 'http://feeds.marketwatch.com/marketwatch/realtimeheadlines/'
    site = "http://finance.yahoo.com/rss/headline?s="

    def get(self, request, symbol):
        feed_response = feedparser.parse(str(self.site) + symbol)
        entries = feed_response['entries']
        return JsonResponse({'articles': entries})

class ArticleSentiment(View):
    alchemy = AlchemyAPI()

    def get(self, request):
        url = self.request.GET.get('url', False)
        if url:
            sentiment = self.alchemy.sentiment('url', url).get('docSentiment')
            if sentiment:
                sentiment.setdefault('score', 0)
                return JsonResponse(sentiment)
        return JsonResponse({'error': 'Missing Url'})


class TextSentimentView(View):
    alchemy = AlchemyAPI() 

    def post(self, request):
        tweet_id = request.POST.get('tweet_id',False)
        if not tweet_id:
            return redirect('sentiment:text')
        
        # Get Tweet And Check If It Has Sentiment In DB
        obj = Tweet.objects.get(tweet_id=tweet_id)
        tweet_type = ContentType.objects.get_for_model(obj)
        sentiment = Sentiment.objects.filter(content_type__pk=tweet_type.id,object_id=obj.id)
        
        if len(sentiment) == 0:
            alchemy_result = self.alchemy.sentiment('text', obj.text)  
            if alchemy_result.get('status', False) != 'OK':
                return redirect('sentiment:text')
                # Delete Tweet From DB
            sentiment = Sentiment.objects.create(
                score=alchemy_result['docSentiment'].get('score', 0), 
                value=alchemy_result['docSentiment']['type'],
                content_object=obj
            )
        
        # Build the Redirect Route
        route = '/sentiment/text/?tweet_id={}'.format(tweet_id)
        return redirect(route)

    def get(self, request):
        tweet_id = request.GET.get('tweet_id',False)
        if not tweet_id:
            return JsonResponse(dict(error='Empty Sentiment Get'))
        obj = Tweet.objects.get(tweet_id=tweet_id)
        tweet_type = ContentType.objects.get_for_model(obj)
        sentiment = Sentiment.objects.filter(content_type__pk=tweet_type.id,object_id=obj.id)
        
        # This Should Check If Sentiment Returns Anything other Than 1
        if len(sentiment) == 0:
            return JsonResponse(dict(error='No Sentiment In DB'))
        q = dict(date=obj.tweet_date.strftime("%Y-%m-%d %H:%M:%S%z"), 
            height=sentiment[0].score, radius=obj.favorites, title=obj.text)
        return JsonResponse(q)

 

def make_twython(profile_token=None, profile_secret=None):
    return Twython(
        os.environ['TWITTER_KEY'], 
        os.environ['TWITTER_SECRET'], 
        profile_token, profile_secret)

class AppView(View):

    def get(self, request):
        callback_url = request.META['HTTP_REFERER'] + 'twitter/callback'
        twitter = make_twython()
        auth = twitter.get_authentication_tokens(callback_url=callback_url)
        request.session['OAUTH_TOKEN'] = auth['oauth_token']
        request.session['OAUTH_TOKEN_SECRET'] = auth['oauth_token_secret']
        return redirect(auth['auth_url'])

class CallbackView(View):

    def get(self, request):
        oauth_verifier = request.GET['oauth_verifier']
        twitter = make_twython(request.session['OAUTH_TOKEN'], request.session['OAUTH_TOKEN_SECRET'])
        final_step = twitter.get_authorized_tokens(oauth_verifier)
        request.session['OAUTH_TOKEN'] = final_step['oauth_token']
        request.session['OAUTH_TOKEN_SECRET'] = final_step['oauth_token_secret']
        request.session['screen_name'] = final_step['screen_name']
        return redirect('/users/register')

class SearchView(View):

    def post(self, request):
        user_query = request.POST.get('search')  
        if not user_query:
            return JsonResponse(dict(error="Please enter a search value"))
        twitter = make_twython()
        max_id = None
        twython_results = []
        for i in range(4):
            tweets = twitter.search(
                                q=user_query, 
                                result_type=request.POST['filter'], 
                                lang='en',max_id=max_id
                            )
            if len(tweets['statuses']) == 0:
                break
            twython_results+=tweets['statuses']
            max_id = tweets['statuses'][-1]['id']-1
        keyword, created = Keyword.objects.get_or_create(search=user_query.lower())
        if not created:
            stored_tweets_of_query = keyword.tweet.all()#tweets in the database
        else:
            stored_tweets_of_query = []
        new_tweets = help.process_tweets_with_sentiment(twython_results, stored_tweets_of_query)

        keyword.tweet.add(*new_tweets)
        all_tweets = keyword.tweet.all().prefetch_related('sentiment').values('text','tweet_id','favorites','tweet_date','sentiment__value','sentiment__score')
        # prefetch sentiment if you can
        tweet_dataset = list(all_tweets)
        # put this key assignment in a function
        for tweet in tweet_dataset:
            tweet['date'] = tweet['tweet_date'].strftime("%Y-%m-%d %H:%M:%S%z")
            tweet['height'] = tweet['sentiment__score']
            tweet['radius'] = tweet['favorites']
            tweet['title'] = tweet['text']
        
        if len(tweet_dataset) is 0:
            data = dict(error='Please simplify your search',search=user_query)
        else:
            data = dict(error=None,values=tweet_dataset,search=user_query,search_type='popular')
        return JsonResponse(data)

class SearchListView(View):
    # Split This Into Different Views
    def post(self, request):
        user_query = request.POST.get('search') 
        profile = Profile.objects.filter(user__pk=request.user.id)
        twitter = make_twython(profile[0].token, profile[0].secret)
        users_lists = twitter.show_owned_lists(screen_name=request.user.username)
        # owned_list_names = (item['name'].lower()==list_name.lower() for item in users_lists['lists'])

        list_name = request.POST.get('listName')
        if not any(item['name'].lower()==list_name.lower() for item in users_lists['lists']): 
            return JsonResponse(dict(error='List Not Found.'))
        # --------------------------------------------------------------------
        # Read In The Timeline
        max_id = None
        # get_specific_list
        timeline = []
        # This Should be a View
        # Add more option so users can look back through the timeline
        for i in range(2):
            tweets = twitter.get_list_statuses(slug=list_name, owner_screen_name=request.user.username, count=200,max_id=max_id)
            if len(tweets) == 0:
                break
            timeline+=tweets
            max_id = tweets[-1]['id']-1
        # --------------------------------------------------------------------      
        list_dataset = help.process_list_tweets(user_query,timeline)
        return JsonResponse(dict(tweets=list_dataset,search_type='list'))

# def parse_user_query(query):
#     if query[0] == '"' and query[-1] == '"':
#         # exact phrase match
#     else:
#         partitioned = query.split(" ")
#         check_or = partitioned.index("OR")
#         if check_or == 1:
#             # two filters
#         elif check_or != -1:
#             return "Error"

#         if partitioned:
#             queries = []
#             for idx in range(len(partitioned)):
#                 if word[idx][0] == "-":
#                     # results do not contain this word
#                     # filter last
#                     # results contain either the previous word or the preceding word
#                 else:
#                     # results contain this word[idx]
#             queries.sort(key=len,reverse=True)
#         else:
#             return "Error" 
# class DeleteTweet(View):

#     def post(self, request, tweet_id):
#         tweet = Tweet.objects.filter(tweet_id=tweet_id)
#         if len(tweet) == 1:
#             tweet.delete()
#             data = {'success':'Successfully Deleted Tweet.'}
#         else:
#             data = {'error':'Tweet Not Found.'}
#         return JsonResponse(data)