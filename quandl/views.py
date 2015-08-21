import datetime
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl,Google
from markit.models import Markit

# Change This View To Get Historic Only
def get_variables(query_dict):
    variables = dict(code=query_dict.get('code'),
            source_code=query_dict.get('source_code'),
            start_date=query_dict.get('start date'),
            company_name=query_dict.get('company_name'))
    if not all(variables.values()):
        variables['error'] = 'Missing Input'
    return variables

class QuandlHistoryView(View):

    def get(self, request):
        # These 6 lines Check Input NOT DRY
        # Could Try all(request.GET.values())
        query_dict = get_variables(request.GET)
        if 'error' in query_dict:
            return JsonResponse(dict(error='Missing Input'))

        start_date = datetime.datetime.strptime(query_dict['start_date'], "%Y-%m-%d").date()
        stock_history = Quandl.get_dataset(query_dict['source_code'],query_dict['code'],str(start_date))
        if stock_history['error']:
            return JsonResponse(stock_history)
        else:
            return JsonResponse(dict(symbol=stock_history['symbol'],close=processed_data[::-1]))

# Todays Prices Only
class IntraDayView(View):

    def get(self,request):
        ticker = request.GET.get("ticker")
        # Find New Source
        prices = Google.get_intra_day_prices(60,1,ticker)
        return JsonResponse(prices)

# start date to current minute prices
class FullRangeView(View):
    def get(self, request):
        # These 6 lines Check Input NOT DRY
        # Could Try all(request.GET.values())
        query_dict = get_variables(request.GET)
        if 'error' in query_dict:
            return JsonResponse(dict(error='Missing Input'))

        start_date = datetime.datetime.strptime(query_dict['start_date'], "%Y-%m-%d").date()
        stock_history = Quandl.get_dataset(query_dict['source_code'],query_dict['code'],str(start_date))
        if stock_history['error']:
             return JsonResponse(stock_history)
        daily = Google.get_intra_day_prices(60,1,stock_history['symbol'])
        if daily['error']:
            return JsonResponse(dict(symbol=stock_history['symbol'],close=stock_history['prices'][::-1]))
        else:
            return JsonResponse(dict(symbol=stock_history['symbol'],close=stock_history['prices'][::-1]+[daily['prices'][0]]+daily['prices']))

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