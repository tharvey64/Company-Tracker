from datetime import datetime
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl, Company, StockPrice
from markit.models import Markit

from quandl.aapl import aapl_history

class IndexView(View):
    template = 'quandl/graph.html'

    def get(self,request):
        return render(request, self.template)

class StockHistory(View):

    def get(self,request,symbol,date_string):
        # need to validate the date somewhere
        if not Company.objects.filter(symbol=symbol): 
            return JsonResponse({'error':'company not found'})
        start_date = datetime.strptime(date_string, "%B-%d-%Y")
        stock_history = StockPrice.objects.filter(company__symbol=symbol).filter(created_at__gte=start_date)
        if stock_history:
            data = {'close': [[day.created_at, day.close_price, day.volume] for day in stock_history]}
        else:
            data = {'error': 'Stock Data Not Found'}
        return JsonResponse(data)

class CreateCompany(View):

    def post(self, request):
        request.POST.get(symbol)


class CompanyView(View):

    def get(self, request):
        company = Company.objects.filter(symbol=request.GET.get('symbol',False))
        if company:
            return JsonResponse({'company': dict(name=company[0].name,symbol=company[0].symbol,exchange=company[0].exchange)})
        return JsonResponse({'error':'Company Not Found.'})

# class QuandlData(View):

#     def get(self, request, code):
#         # send date to quandl
#         return JsonResponse(Quandl.get_dataset(code))

#     def post(self, request):
#         pass
