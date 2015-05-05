from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl
from quandl.aapl import aapl_history
from tracker_project.settings import quandl_api_key
# Create your views here.

class IndexView(View):
    template = 'quandl/graph.html'

    def get(self,request):
        return render(request, self.template)

class StockHistory(View):

    def get(self,request):
        # data = Quandl.get_dataset()
        data = {'close': aapl_history[:200]}
        return JsonResponse(data)