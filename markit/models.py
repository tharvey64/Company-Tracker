from django.db import models
import requests
# Create your models here.

class Markit:
    company_search_url = 'http://dev.markitondemand.com/Api/v2/Lookup/json?input='
    quote_url = 'http://dev.markitondemand.com/Api/v2/Quote/json?symbol='

    @classmethod
    def find_company(cls, name):
        if not isinstance(name, str):
            return {'Error':'Error Invalid Input Type'}
        response = requests.get(cls.company_search_url + name)
        if response.status_code == 200:
            return response.json()
        return {'Error':'Request Error'}

    @classmethod
    def find_quote(cls, symbol):
        if not isinstance(symbol, str):
            return {'Error':'Error Invalid Input Type'}
        response = requests.get(cls.quote_url + symbol)
        if response.status_code == 200:
            return response.json()
        return {'Error':'Request Error'}

    # http://finance.yahoo.com/q?s=APPL&ql=1
    # might become static method
    # @classmethod
    # def market_view(cls):

    # @classmethod
    # def market_news(cls,**kwargs):
        
    # @classmethod
    # def security_news(cls,**kwargs):