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

class StockHistoryView(View):

    def get(self,request,symbol,date_string):
        # need to validate the date somewhere
        if not Company.objects.filter(symbol__iexact=symbol): 
            return redirect('quandl:create', symbol=symbol)
        start_date = datetime.strptime(date_string, "%B-%d-%Y").date()
        stock_history = StockPrice.objects.filter(company__symbol__iexact=symbol)
        stock_history = stock_history.filter(created_at__gte=start_date)
        if stock_history:
            data = {'close': [[day.created_at, day.close_price, day.volume] for day in stock_history]}
        else:
            data = {'error': 'Stock Data Not Found'}
        return JsonResponse(data)

    def post(self, request, symbol, date_string):
        symbol = request.POST.get('symbol', False)
        exchange = request.POST.get('exchange', False)
        db = "GOOG"
        company = Company.objects.filter(symbol=symbol)
        if not (company and (symbol and exchange)):
            return JsonResponse({'error': 'Missing Input.'})
        code = "{}/{}_{}".format(db,exchange,symbol)
        prices = Quandl.get_dataset(code)
        if 'data' in prices:
            stock_prices = []

            for day in prices['data']:
                date = datetime.strptime(day[0],'%Y-%m-%d').date()
                stock_prices.append(
                    StockPrice(    
                        open_price=day[1] if day[1] else 0.0,
                        close_price=day[4] if day[4] else 0.0, 
                        high_price=day[2] if day[2] else 0.0,  
                        low_price=day[3] if day[3] else 0.0, 
                        volume=day[5] if day[5] else 0.0,
                        company=company[0],
                        created_at=date
                    )
                )
            StockPrice.objects.bulk_create(stock_prices)
            return redirect('quandl:history',symbol=symbol,date_string="January-1-2005")
        return JsonResponse({'error': 'Shit.'})


# Company CRUD
class CreateCompanyView(View):

    def get(self, request, symbol):
        return JsonResponse({'stocks': Markit.find_company(symbol)})

    def post(self, request, symbol):

        symbol = request.POST.get('symbol', False)
        name = request.POST.get('name', False)
        exchange = request.POST.get('exchange', False)

        if not (symbol and name and exchange):
            # Should this be a redirect
            return JsonResponse({'error': 'Missing Input.'})
        
        company = Company.objects.filter(symbol=symbol)

        if company:
            return redirect('quandl:view', symbol=symbol)
        company = Company.objects.create(
            symbol=symbol,
            name=name,
            exchange=exchange
        )
        return redirect('quandl:view', symbol=symbol)

class CompanyView(View):

    def get(self, request, symbol):
        company = Company.objects.filter(symbol=symbol)
        if company:
            return JsonResponse({
                'company': dict(
                    name=company[0].name,
                    symbol=company[0].symbol,
                    exchange=company[0].exchange
                )
            })
        return redirect('quandl:create', symbol=symbol)

# class DeleteCompanyView(View):
#     # delete?
#     def post(self, request):
#         company = Company.objects.filter(symbol=request.POST.get('symbol', False))
#         if len(company) == 1:
#             company[0].delete()
#             return JsonResponse({'deleted': True})
#         return JsonResponse({'deleted': False})

# class UpdateCompanyView(View):

#     def post(self,request):
#         symbol = request.POST.get('symbol', False)
#         name = request.POST.get('name', False)
#         exchange = request.POST.get('exchange', False)  

#         if not (symbol and name and exchange):
#             # Should this be a redirect
#             return JsonResponse({'error': 'Missing Input.'})
#         company = Company.objects.filter(symbol=symbol)
#         if company:
#             company[0].exchange = exchange
#             company[0].name = name
#             company[0].save()
#             return JsonResponse({'updated': True})
#         return JsonResponse({'updated': False})