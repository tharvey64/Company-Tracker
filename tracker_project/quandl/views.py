from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl
from quandl.aapl import aapl_history
# Create your views here.

class IndexView(View):
    template = 'quandl/graph.html'

    def get(self,request):
        return render(request, self.template)

class StockHistory(View):

    def get(self,request):
        # data = Quandl.get_dataset()
        data = {'close': [[day[0],day[11],day[12]] for day in aapl_history[:200]]}
        return JsonResponse(data)