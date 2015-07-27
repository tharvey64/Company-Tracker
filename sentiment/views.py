import datetime
from django.shortcuts import redirect
from django.views.generic import View
from django.http import JsonResponse
from django.contrib.contenttypes.models import ContentType
from twython import Twython
from sentiment.alchemyapi import AlchemyAPI
from sentiment.models import Sentiment
from twitter.models import Tweet
# Create your views here.

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
