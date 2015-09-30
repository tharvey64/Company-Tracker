import datetime
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl,Google,Yahoo
from markit.models import Markit

def get_variables(query_dict):
    variables = dict(code=query_dict.get('code'),
            source_code=query_dict.get('source_code'),
            start_date=query_dict.get('start_date'),
            company_name=query_dict.get('company_name'))
    if not all(variables.values()):
        variables['error'] = 'Missing Input'
    return variables

class QuandlHistoryView(View):

    def get(self, request):
        # Could Try all(request.GET.values())
        query_dict = get_variables(request.GET)
        if 'error' in query_dict:
            return JsonResponse(dict(error='Missing Input'))

        start_date = datetime.datetime.strptime(query_dict['start_date'], "%Y-%m-%d").date()
        stock_history = Quandl.get_dataset(query_dict['source_code'],query_dict['code'],str(start_date))
        if stock_history['error']:
            return JsonResponse(stock_history)
        else:
            return JsonResponse(dict(symbol=stock_history['symbol'],values=processed_data[::-1]))

# Todays Prices Only
class IntraDayView(View):

    def get(self,request):
        ticker = request.GET.get("ticker")
        # Find New Source
        prices = Yahoo.get_intra_day_prices(ticker)
        return JsonResponse(dict(error=prices['error'],values=prices['prices']))

# start date to current minute prices
class FullRangeView(View):

    def get(self, request):
        # Could Try all(request.GET.values())
        query_dict = get_variables(request.GET)
        if 'error' in query_dict:
            return JsonResponse(dict(error='Missing Input'))
        
        start_date = datetime.datetime.strptime(query_dict['start_date'], "%Y-%m-%d")
        
        stock_history = Quandl.get_dataset(query_dict['source_code'],query_dict['code'],str(start_date))
        
        daily = Yahoo.get_intra_day_prices(stock_history['symbol'], 1)

        if stock_history['error'] and daily['error']:
            print("-"*50,"quandl/views","-"*50)
            print("quandl/views.py 57\n",stock_history['error'])
            print("quandl/views.py 58\n", daily['error'])
            print("^"*50,"quandl/views","^"*50)
            return JsonResponse(dict(error="No Daily or Historical Data", values=None))
        elif daily['error']:
            # print("quandl/views.py 58",stock_history)
            close = stock_history['prices'][::-1]
        elif stock_history['error']:
            close = daily['prices']
        else:
            # Adds Last Historical Price Twice
            close = stock_history['prices'][::-1]+[daily['prices'][0]]+daily['prices']
        return JsonResponse(dict(error=None, search=stock_history['symbol'], values=close))

#######################
#######################
# XX CLEAN UP CSS
# PRELOAD STOCK SEARCH WITH RESULTS
# ADD CELERY AND RABBIT MQ TO PING TWITTER FOR TWEETS
# DOWNLOAD THE QUANDL LIBRARY
# DELETE MARKIT APP RENAME QUANDL APP
#######################
#######################
# GET DIFF FROM PREVIOUS PRICE AND % CHANGE FROM PREVIOUS TRY TO PLOT CHANGES IN MOMENTUM 
# DIFF, RDIFF, MOVING AVG
# These 6 lines Check Input NOT DRY
# THESE SHOULD ALL GO IN AS DIFFERENT HEIGHTS
# THIS WILL BE THE FIRST IMPLEMENTATION OF THE GRAPH OPTIONS
# PERCENT CHANGE BETWEEN 1 AND -1