from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import JsonResponse,Http404
import requests
import json
from pprint import pprint

# Create your views here.

class WelcomeView(View):
	template = 'stockgraph/index.html'

	def get(self, request):
		return render(request, self.template)

class CompanyView(View):
	lookup_url = "http://dev.markitondemand.com/Api/v2/Lookup/json?input="
	# quote_url = "http://dev.markitondemand.com/Api/v2/Quote/json?symbol="

	def post(self, request):
		r = requests.get(self.lookup_url + request.POST['company'])
		ticker = r.json()[0]['Symbol']
		# stock = (requests.get(self.quote_url + ticker)).json()['LastPrice']
		return JsonResponse({'data' : [{'info' : ticker}]})
		# return JsonResponse({'data' : [{'info': str(block) + ' : ' + str(stock[block])} for block in stock]})