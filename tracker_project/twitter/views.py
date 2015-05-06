from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import JsonResponse
from twython import Twython
from alchemyapi import AlchemyAPI
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
        result = twitter.search(q=request.POST['search'], count=5, result_type=request.POST['type'], lang='en') #everything
        start_point = result['statuses'] #one level into result... shouldnt have to use result again
        for tweet in start_point:
            if tweet['user']['followers_count'] > 5000:
                tweets.append(tweet['text']) # if user has more than 5k followers, we keep thier tweet
        response = self.alchemyapi.sentiment("text", ('').join(actual_words))
        feeling = response.get("docSentiment")
        if feeling == None:
            return JsonResponse({'result' : 'There was a problem searching for ' + request.POST['search'] + '. Please try a different filter.'})
        return JsonResponse({'dates' : [{'date' : date['created_at']} for date in start_point], 
                            'feelings' : [{'feeling' : self.alchemyapi.sentiment("text", block)} for block in tweets], 
                            'favorites' : [{'favorite' : favorite['favorite_count']} for favorite in start_point]})


