from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import JsonResponse
from twython import Twython
from alchemyapi import AlchemyAPI
from collections import Counter
from tracker_project.settings import TWITTER_KEY
from tracker_project.settings import TWITTER_SECRET

class SearchView(View):
    template = 'twitter/index.html'
    alchemyapi = AlchemyAPI()


    def get(self, request):
       return render(request, self.template)

    def post(self, request):
        tweets = []
        twitter = Twython(TWITTER_KEY, TWITTER_SECRET)
        result = twitter.search(q=request.POST['search'], count=100, result_type=request.POST['type'], lang='en') #everything
        start_point = result['statuses'] #one level into result... shouldnt have to use result again
        for tweet in start_point:
            if tweet['user']['followers_count'] > 5000:
                tweets.append(tweet['text']) # if user has more than 5k followers, we keep thier tweet
        broken_down = [line['entities'] for line in start_point] #hashtags 1
        almost_there = [block['hashtags'] for block in broken_down] #hashtags 2
        hashtags = [last[0]['text'].lower() for last in almost_there if len(last) > 0] #hashtags final
        hash_dict = Counter(hashtags)
        top_hashes = hash_dict.most_common(5)      
        return JsonResponse({'dates' : [{'date' : date['created_at']} for date in start_point], 
                            # 'feelings' : [{'feeling' : self.alchemyapi.sentiment("text", block)} for block in tweets], 
                            'favorites' : [{'favorite' : favorite['favorite_count']} for favorite in start_point],
                             'hashes': [{'name': hashe[0]} for hashe in top_hashes],
                             'tweets' : [{'content' : line} for line in tweets]})

