from django.shortcuts import render
from django.http import JsonResponse
from django.views.generic import View
import feedparser
from alchemyapi import AlchemyAPI


# Create your views here.
class YahooArticleListView(View):
    # site = 'http://feeds.marketwatch.com/marketwatch/realtimeheadlines/'
    site = "http://finance.yahoo.com/rss/headline?s="

    def get(self, request, symbol):
        feed_response = feedparser.parse(self.site + symbol)
        entries = feed_response['entries']
        return JsonResponse({'articles': entries})

class ArticleSentiment(View):
    alchemy = AlchemyAPI()

    def get(self, request):
        url = self.request.GET.get('url', False)
        if url:
            return JsonResponse(self.alchemy.sentiment('url', url))
        return JsonResponse({'error': 'Missing Url'})
