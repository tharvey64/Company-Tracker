import datetime
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from quandl.models import Quandl, Company, StockPrice, LastPrice
from markit.models import Markit
import quandl.helper as help
  
class QuandlHistoryView(View):

    def get(self, request, symbol, date_string):
        if not LastPrice.objects.filter(company__symbol__iexact=symbol): 
            return redirect('quandl:company-create', symbol=symbol)

        start_date = datetime.datetime.strptime(date_string, "%B-%d-%Y").date()
        stock_history = StockPrice.objects.filter(company__symbol__iexact=symbol).filter(created_at__gte=start_date)

        if stock_history:
            data = {'close': [[day.created_at, day.close_price, day.volume] for day in stock_history]}
        else:
            # Redirect to An Error?
            data = {'error': 'Stock Data Not Found'}
        return JsonResponse(data)

    def post(self, request, symbol, date_string):
        print("is_active: ",request.user.is_active)
        print("is_authenticated: ",request.user.is_authenticated())
        print("is_anonymous: ",request.user.is_anonymous())
        print(type(request.user))
        last_close = LastPrice.objects.filter(company__symbol__iexact=symbol)

        if not help.check_company(last_close): 
            return redirect('quandl:company-create', symbol=symbol)

        if not help.check_date(last_close):
            return redirect('quandl:history', symbol=symbol, date_string=date_string)

        company = last_close[0].company
        update_start = str(last_close[0].updated_at + datetime.timedelta(days=1))
        prices = Quandl.get_dataset(company.exchange, company.symbol, update_start)
        
        if 'error' in prices:
            # Redirect to An Error View
            return JsonResponse(prices)

        if prices.get('data', False):
            stock_prices = help.stock_price_list(prices['data'], company)
            StockPrice.objects.bulk_create(stock_prices)  
            last_close[0].updated_at = prices['data'][0][0]
            last_close[0].save()

        if not date_string:
            date_string = 'January-1-2005'
        return redirect('quandl:history', symbol=symbol, date_string=date_string)

class CreateCompanyView(View):

    def get(self, request, symbol):
        companies = [company for company in Markit.find_company(symbol) if not company['Exchange'].startswith('BAT')]
        return JsonResponse({'stocks': companies})

    def post(self, request, symbol):
        symbol = request.POST.get('symbol', False)
        name = request.POST.get('name', False)
        exchange = request.POST.get('exchange', False)

        if not (symbol and name and exchange):
            # Redirect to An Error View
            return JsonResponse({'error': 'Missing Input.'})

        if not Company.objects.filter(symbol__iexact=symbol):
            company = Company.objects.create(
                symbol=symbol,
                name=name,
                exchange=exchange
            )
            LastPrice.objects.create(company=company)
        return redirect('quandl:company-view', symbol=symbol)

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
        # Make this a Json
        return redirect('quandl:company-create', symbol=symbol)

# class DeleteCompanyView(View):
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