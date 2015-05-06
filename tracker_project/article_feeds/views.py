from django.shortcuts import render
from django.http import JsonResponse
from django.views.generic import View
import feedparser


# Create your views here.
class YahooArticleListView(View):
    # site = 'http://feeds.marketwatch.com/marketwatch/realtimeheadlines/'
    site = "http://finance.yahoo.com/rss/headline?s="

    def get(self, request, symbol):
        feed_response = feedparser.parse(self.site + symbol)
        entries = feed_response['entries']
        return JsonResponse({'articles': entries})