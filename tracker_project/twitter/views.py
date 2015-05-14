from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import JsonResponse
from twython import Twython
from alchemyapi import AlchemyAPI
from collections import Counter
from tracker_project.settings import TWITTER_KEY
from tracker_project.settings import TWITTER_SECRET
from sentiment.models import Sentiment
from twitter.models import Tweet
import datetime

class SearchView(View):
    template = 'twitter/index.html'
    alchemyapi = AlchemyAPI()


    def get(self, request):
       return render(request, self.template)

    def post(self, request):
        user_query = request.POST['search']   #the user searched for this 
        print(user_query)
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
                


