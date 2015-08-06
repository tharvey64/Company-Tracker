import datetime
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl,Google
from markit.models import Markit

# Change This View To Get Historic Only
class QuandlHistoryView(View):

    def get(self, request):
        exchange = request.GET.get('exchange',False)
        symbol = request.GET.get('symbol',False)
        date_string = request.GET.get('start date',False)
        if not (exchange and symbol and date_string):
            data = dict(error='Missing Input')
            return JsonResponse(data)
        start_date = datetime.datetime.strptime(date_string, "%B-%d-%Y").date()
        stock_history = Quandl.get_dataset(exchange,symbol,str(start_date))
        # stock_history['data']
        # ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
        # Date = 'YYYY-MM-DD' << month and Day are zero padded
        # print(stock_history)
        if stock_history and 'data' in stock_history:
            processed_data = [dict(date=day[0]+' 16:00:00', height=day[4], radius=day[5], title=day[0]) for day in stock_history['data']]
            data = dict(symbol=symbol,close=processed_data[::-1])
        else:
            data = dict(error='Stock Data Not Found')
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
        exchange = request.GET.get('exchange',False)
        symbol = request.GET.get('symbol',False)
        date_string = request.GET.get('start date',False)
        if not (exchange and symbol and date_string):
            data = dict(error='Missing Input')
            return JsonResponse(data)
        start_date = datetime.datetime.strptime(date_string, "%B-%d-%Y").date()
        stock_history = Quandl.get_dataset(exchange,symbol,str(start_date))
        if stock_history and 'data' in stock_history:
            # historic
            processed_data = [dict(date=day[0]+' 16:00:00', height=day[4], radius=day[5], title=day[0]) for day in stock_history['data']]
            # current day
            daily = Google.get_intra_day_prices(60,1,symbol)
            data = dict(symbol=symbol,close=processed_data[::-1]+[daily['prices'][0]]+daily['prices'])
        else:
            data = dict(error='Stock Data Not Found')
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