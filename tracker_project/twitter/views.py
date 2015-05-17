from django.shortcuts import redirect
from django.views.generic import View
from django.http import JsonResponse
from twython import Twython
from alchemyapi import AlchemyAPI
from tracker_project.settings import TWITTER_KEY
from tracker_project.settings import TWITTER_SECRET
from sentiment.models import Sentiment
from twitter.models import Tweet
import datetime

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
        print(request.POST)
        user_query = request.POST['search']   #the user searched for this  
        if request.POST['path'] == 'random':        
            twitter = Twython(TWITTER_KEY, TWITTER_SECRET)           
            twython_results = twitter.search(q=user_query, result_type=request.POST.get('type',False), lang='en') #twitter search results
            stored_tweets_of_query = Tweet.objects.filter(keyword=user_query) #tweets in the database
            ids = [entry.tweet_id for entry in stored_tweets_of_query] #storing the ids of each tweet searched
            for response in twython_results['statuses']: #iterating through each tweet
                if response['id'] not in ids:
                    alchemy_result = self.alchemyapi.sentiment("text", response['text'])  
                    if alchemy_result['docSentiment'].get('score',False) == False:
                        tweet_sentiment_value = Sentiment.objects.create(score=0, value=alchemy_result['docSentiment']['type'])         
                    else:
                        tweet_sentiment_value = Sentiment.objects.create(score=alchemy_result['docSentiment']['score'], value=alchemy_result['docSentiment']['type'])         
                    formatted_date = datetime.datetime.strptime(response['created_at'], "%a %B %d %X %z %Y")
                    Tweet.objects.create(text=response['text'], tweet_id=response['id'], favorites=response['favorite_count'],
                                        tweet_date=formatted_date, keyword=user_query, sentiment=tweet_sentiment_value)
                else:
                    tweet_to_update = Tweet.objects.filter(tweet_id=response['id'])
                    tweet_to_update[0].favorites = response['favorite_count']
                    tweet_to_update[0].save()
            all_tweets = Tweet.objects.filter(keyword=user_query)
            return JsonResponse({'dates' : [{'date' : str(row.tweet_date)} for row in all_tweets], 
                                'scores' : [{'score' : data.sentiment.score} for data in all_tweets],
                                'favorites' : [{'favorite' : block.favorites} for block in all_tweets],
                                 'tweets' : [{'content' : line.text} for line in all_tweets]})
        else:
            returns = []
            twitter = Twython(TWITTER_KEY, TWITTER_SECRET,
            request.session['OAUTH_TOKEN'], request.session['OAUTH_TOKEN_SECRET'])    
            list_of_tweets = twitter.get_list_statuses(slug=request.POST['list_name'], owner_screen_name=request.session['screen_name'], count=200)              
            for unique_tweet in list_of_tweets:
                if user_query.lower() in unique_tweet['text'].lower():
                    returns.append(unique_tweet)                        
                    alchemy_result = self.alchemyapi.sentiment("text", unique_tweet['text'])
                    if alchemy_result['docSentiment'].get('score',False) == False:
                        returns[-1]['sentiment'] = 0        
                    else:
                        returns[-1]['sentiment'] = alchemy_result['docSentiment']['score']
            if not returns:
                return JsonResponse({'empty': 'Please try another query'})
            return JsonResponse({'dates' : [{'date' : str(datetime.datetime.strptime(row['created_at'], "%a %B %d %X %z %Y"))} for row in returns],
                               'scores' : [{'score' : data['sentiment']} for data in returns],
                               'favorites' : [{'favorite' : block['favorite_count']} for block in returns],
                               'tweets' : [{'content' : line['text']} for line in returns]})
