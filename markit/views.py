from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from markit.models import Markit
# Create your views here.

class IndexView(View):
    template = 'markit/graph.html'

    def get(self,request):
        return render(request, self.template)

class LiveStock(View):

    def get(self, request, symbol):
        data = Markit.find_quote(symbol)
        return JsonResponse(data)

class CompanySearch(View):

    def get(self, request):
        search_result = Markit.find_company(request.GET.get('input_string',False))
        # print(search_result)
        return JsonResponse({'list': search_result})

# INTRA DAY DATA
# 
# http://www.google.com/finance/getprices?i=[INTERVAL]&p=[PERIOD]&f=d,o,h,l,c,v&df=cpct&q=[TICKER]
# 
# f=d,o,h,l,c,v
# 
#  d=dateTime,o=open,h=high,l=low,c=close,v=volume
# [INTERVAL] = Interval or frequency in seconds
# [PERIOD] = the historical data period
# [TICKER] = Stock Ticker