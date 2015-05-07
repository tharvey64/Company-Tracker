from datetime import datetime
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl, Company, StockPrice

from quandl.aapl import aapl_history

class IndexView(View):
    template = 'quandl/graph.html'

    def get(self,request):
        return render(request, self.template)

class StockHistory(View):

    def get(self,request,symbol,date_string):
        # need to validate the date somewhere
        start_date = datetime.strptime(date_string, "%B-%d-%Y")
        stock_history = StockPrice.objects.filter(company__symbol=symbol).filter(created_at__gte=start_date)
        if stock_history:
            data = {'close': [[day.created_at, day.close_price, day.volume] for day in stock_history]}
        else:
            data = {'error': 'Stock Data Not Found'}
        return JsonResponse(data)

class QuandlData(View):

    def get(self, request, code):
        return JsonResponse(Quandl.get_dataset(code))

    def post(self, request):
        pass
        # EDIT >>> Call this to initially insert the stock data
        # Only update Stock Data When that Stock Is Requested
        
        # Take the New Stock Prices and store them in the db
        #### This Will be A Bulk Create Method
