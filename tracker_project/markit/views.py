from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.generic.base import View
from markit.models import Markit
# Create your views here.

class IndexView(View):
    template = 'markit/graph.html'

    def get(self,request):
        return render(request, self.template)

class LiveStock(View):

    def get(self, request, symbol):
        data = Markit.find_quote(symbol)
        return JsonResponse(data)

class CompanySearch(View):

    def get(self, request, input_string):
        data = Markit.find_company(input_string)
        return JsonResponse(data)