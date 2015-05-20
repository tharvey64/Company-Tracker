import datetime
from django.shortcuts import redirect
from django.views.generic import View
from django.http import JsonResponse
from twython import Twython
from sentiment.alchemyapi import AlchemyAPI
from sentiment.models import Sentiment
from twitter.models import Tweet, Keyword, Profile
from tracker_project.settings import TWITTER_KEY, TWITTER_SECRET 

class AppView(View):
    twitter = Twython(TWITTER_KEY, TWITTER_SECRET)
    auth = twitter.get_authentication_tokens(callback_url='http://127.0.0.1:8000/twitter/callback')

    def get(self, request):
        request.session['OAUTH_TOKEN'] = self.auth['oauth_token']
        request.session['OAUTH_TOKEN_SECRET'] = self.auth['oauth_token_secret']
        return redirect(self.auth['auth_url'])

class CallbackView(View):

    def get(self, request):
        oauth_verifier = request.GET['oauth_verifier']
        twitter = Twython(TWITTER_KEY, TWITTER_SECRET,
            request.session['OAUTH_TOKEN'], request.session['OAUTH_TOKEN_SECRET'])
        final_step = twitter.get_authorized_tokens(oauth_verifier)
        request.session['OAUTH_TOKEN'] = final_step['oauth_token']
        request.session['OAUTH_TOKEN_SECRET'] = final_step['oauth_token_secret']
        request.session['screen_name'] = final_step['screen_name']
        return redirect('/users/register')

class SearchView(View):
    alchemyapi = AlchemyAPI()

    def post(self, request):
        user_query = request.POST['search']   #the user searched for this  

        twitter = Twython(TWITTER_KEY, TWITTER_SECRET)
        twython_results = twitter.search(q=user_query, result_type=request.POST.get('type',False), lang='en') #twitter search results
        
        keyword, created = Keyword.objects.get_or_create(search=user_query)

        stored_tweets_of_query = keyword.tweet.all()#tweets in the database

        new_tweets = []
        for response in twython_results['statuses']: #iterating through each tweet

            old_tweet = stored_tweets_of_query.filter(tweet_id=response['id_str'])
            
            if old_tweet and len(old_tweet) == 1:
                old_tweet[0].favorites = response['favorite_count']
                old_tweet[0].save()
            else:
                alchemy_result = self.alchemyapi.sentiment('text', response['text'])  
                if alchemy_result.get('status', False) != 'OK':
                    continue

                tweet_sentiment_value = Sentiment.objects.create(
                    score=alchemy_result['docSentiment'].get('score', 0), 
                    value=alchemy_result['docSentiment']['type']
                )   

                formatted_date = datetime.datetime.strptime(response['created_at'], "%a %B %d %X %z %Y")

                tweet = Tweet.objects.create(
                    text=response['text'], 
                    tweet_id=response['id_str'], 
                    favorites=response['favorite_count'],
                    tweet_date=formatted_date, 
                    sentiment=tweet_sentiment_value
                )
                new_tweets.append(tweet)
        keyword.tweet.add(*new_tweets)
        all_tweets = new_tweets + list(stored_tweets_of_query)
        tweet_dataset = [dict(date=row.tweet_date.strftime("%Y-%m-%d %H:%M:%S%z"), height=row.sentiment.score, radius=row.favorites, title=row.text) for row in all_tweets]
        return JsonResponse({'tweets': tweet_dataset})

class SearchListView(View):
    alchemyapi = AlchemyAPI()

    def post(self, request):
        user_query = request.POST['search'] 
        profile = Profile.objects.filter(user__pk=request.user.id)
        twitter = Twython(TWITTER_KEY, TWITTER_SECRET, profile[0].token, profile[0].secret)
        list_of_tweets = twitter.get_list_statuses(slug=request.POST['listName'], owner_screen_name=request.user.username, count=200)
        list_dataset = []
        for unique_tweet in list_of_tweets:
            if user_query.lower() in unique_tweet['text'].lower():

                alchemy_result = self.alchemyapi.sentiment("text", unique_tweet['text'])
                if not alchemy_result.get('docSentiment', False):
                    continue
                unique_tweet['sentiment'] = alchemy_result['docSentiment'].get('score', 0)
                unique_tweet['created_at'] = datetime.datetime.strptime(unique_tweet['created_at'], "%a %B %d %X %z %Y")

                list_dataset.append(dict(
                    date=unique_tweet['created_at'].strftime("%Y-%m-%d %H:%M:%S%z"), 
                    height=unique_tweet['sentiment'], 
                    radius=unique_tweet['favorite_count'], 
                    title=unique_tweet['text']
                ))
        return JsonResponse({'tweets': list_dataset})