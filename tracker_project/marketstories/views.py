from django.shortcuts import render
import feedparser
from django.http import JsonResponse
from django.views.generic import View


# Create your views here.
class CompanyArticleView(View):
    # site = 'http://feeds.marketwatch.com/marketwatch/realtimeheadlines/'
    site = "http://finance.yahoo.com/rss/headline?s=AAPL"

    def get(self, request):
        d = feedparser.parse(self.site)
        print(d)
        stories = [[thing['title'], thing['published'], thing['link']] for thing in d.entries]
        return JsonResponse({'result': [{'title' : story[0], 'date' : story[1], 'link' : story[2]} for story in stories]})