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
    # def post(self, request):
    #     tweets = []
        
    #     start_point = result['statuses'] #one level into result... shouldnt have to use result again
    #     for tweet in start_point:
    #         if tweet['user']['followers_count'] > 5000:
    #             tweets.append(tweet['text']) # if user has more than 5k followers, we keep thier tweet
    #     broken_down = [line['entities'] for line in start_point] #hashtags 1
    #     almost_there = [block['hashtags'] for block in broken_down] #hashtags 2
    #     hashtags = [last[0]['text'].lower() for last in almost_there if len(last) > 0] #hashtags final
    #     hash_dict = Counter(hashtags)
    #     top_hashes = hash_dict.most_common(5)      
    #     return JsonResponse({'dates' : [{'date' : date['created_at']} for date in start_point], 
    #                         # 'feelings' : [{'feeling' : self.alchemyapi.sentiment("text", block)} for block in tweets], 
    #                         'favorites' : [{'favorite' : favorite['favorite_count']} for favorite in start_point],
    #                          'hashes': [{'name': hashe[0]} for hashe in top_hashes],
    #                          'tweets' : [{'content' : line} for line in tweets]})
    def post(self, request):
        user_query = request.POST['search']   #the user searched for this  
        twitter = Twython(TWITTER_KEY, TWITTER_SECRET)           
        twython_results = twitter.search(q=user_query, count=1, result_type=request.POST.get('type',False), lang='en') #twitter search results
        stored_tweets_of_query = Tweet.objects.filter(keyword=user_query) #tweets in the database
        ids = [entry.tweet_id for entry in stored_tweets_of_query] #storing the ids of each tweet searched
        for response in twython_results['statuses']: #iterating through each tweet
            if response['id'] not in ids:
                alchemy_result = self.alchemyapi.sentiment("text", response['text'])  
                tweet_sentiment_value = Sentiment.objects.create(score=alchemy_result['docSentiment']['score'], value=alchemy_result['docSentiment']['type'])         
                formatted_date = datetime.datetime.strptime(response['created_at'], "%a %B %d %X %z %Y")
                Tweet.objects.create(text=response['text'], tweet_id=response['id'], favorites=response['favorite_count'],
                                    tweet_date=formatted_date, keyword=user_query, sentiment=tweet_sentiment_value)
        all_tweets = Tweet.objects.filter(keyword=user_query)
        return JsonResponse({'dates' : [{'date' : str(row.tweet_date)} for row in all_tweets], 
                            'scores' : [{'score' : data.sentiment.score} for data in all_tweets],
                            'favorites' : [{'favorite' : block.favorites} for block in all_tweets],
                             'tweets' : [{'content' : line.text} for line in all_tweets]})
                












