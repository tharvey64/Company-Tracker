import datetime
from django.shortcuts import redirect
from django.views.generic import View
from django.http import JsonResponse
from twython import Twython
from sentiment.alchemyapi import AlchemyAPI
from sentiment.models import Sentiment
from twitter.models import Tweet
# Create your views here.

# class GetTweetSentiment(View):
#     alchemyapi = AlchemyAPI() 
# 
#     def post(self, request, tweet_id):
#                if alchemy_result.get('status', False) != 'OK':
#                     continue

#                 tweet_sentiment_value = Sentiment.objects.create(
#                     score=alchemy_result['docSentiment'].get('score', 0), 
#                     value=alchemy_result['docSentiment']['type']
#                 )  
#       take the csrf token from the post ajax that 
#       wraps the call to this