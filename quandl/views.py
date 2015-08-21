import datetime
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl,Google
from markit.models import Markit

# Change This View To Get Historic Only
class QuandlHistoryView(View):

    def get(self, request):
        source_code = request.GET.get('source_code',False)
        code = request.GET.get('code',False)
        date_string = request.GET.get('start date',False)
        company_name = request.GET.get('company_name',False)
        if not (source_code and code and company_name and date_string):
            data = dict(error='Missing Input')
            return JsonResponse(data)
        group = code.split('_')
        # Do This In The Model
        if len(group) == 1:
            symbol = group[0]
        elif len(group) == 2 and (group[0]=="FUND" or group[0]=="INDEX"):
            symbol = group[1]
        else:
            # print(group)
            return JsonResponse(dict(error=group))
        start_date = datetime.datetime.strptime(date_string, "%B-%d-%Y").date()
        stock_history = Quandl.get_dataset(source_code,code,str(start_date))
        if stock_history['error']:
            data = dict(symbol=symbol,close=processed_data[::-1])
        else:
            data = dict(error=stock_history['error'])
        return JsonResponse(data)

# Todays Prices Only
class IntraDayView(View):

    def get(self,request):
        ticker = request.GET.get("ticker",False)
        prices = Google.get_intra_day_prices(60,1,ticker)
        # no client yet
        return JsonResponse(prices)

# start date to current minute prices
class FullRangeView(View):
    def get(self, request):
        source_code = request.GET.get('source_code',False)
        code = request.GET.get('code',False)
        date_string = request.GET.get('start date',False)
        company_name = request.GET.get('company_name',False)
        if not (source_code and code and company_name and date_string):
            data = dict(error='Missing Input')
            return JsonResponse(data)
        
        group = code.split('_')
        # Do This In The Model
        if len(group) == 1:
            symbol = group[0]
        elif len(group) == 2 and (group[0]=="FUND" or group[0]=="INDEX"):
            symbol = group[1]
        else:
            # print(group)
            return JsonResponse(dict(error=group))
        start_date = datetime.datetime.strptime(date_string, "%B-%d-%Y").date()
        stock_history = Quandl.get_dataset(source_code,code,str(start_date))
        if stock_history['error']:
             return JsonResponse(stock_history)
        daily = Google.get_intra_day_prices(60,1,symbol)
        if daily['error']:
            data = dict(symbol=symbol,close=stock_history['prices'][::-1])
        else:
            data = dict(symbol=symbol,close=stock_history['prices'][::-1]+[daily['prices'][0]]+daily['prices'])
        return JsonResponse(data)

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