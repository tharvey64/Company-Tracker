import datetime
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl
from markit.models import Markit

class QuandlHistoryView(View):

    def get(self, request):
        exchange = request.GET.get('exchange',False)
        symbol = request.GET.get('symbol',False)
        date_string = request.GET.get('start date',False)
        if not (exchange and symbol and date_string):
            data = {'error': 'Missing Input'}
            return JsonResponse(data)
        start_date = datetime.datetime.strptime(date_string, "%B-%d-%Y").date()
        stock_history = Quandl.get_dataset(exchange,symbol,str(start_date))
        # stock_history['data']
        # ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
        # Date = 'YYYY-MM-DD' << month and Day are zero padded
        # print(stock_history)
        if stock_history:
            processed_data = [dict(date=day[0], height=day[4], radius=day[5], title=day[0]) for day in stock_history['data']]
            data = {'symbol': symbol,'close': processed_data}
        else:
            data = {'error': 'Stock Data Not Found'}
        return JsonResponse(data)