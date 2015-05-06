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

    def get(self,request,symbol):
        stock_history = StockPrice.objects.filter(company__symbol=symbol)
        if stock_history:
            data = {'close': [[day.created_at, day.close_price, day.volume] for day in stock_history]}
        else:
            data = {'errors': 'Failure'}
        return JsonResponse(data)