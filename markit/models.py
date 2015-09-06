import os
from urllib.parse import quote
from django.db import models
import requests
# Create your models here.

class Markit:
    test_company_search = 'https://www.quandl.com/api/v2/datasets.json?query={query}&source_code={database}&per_page={per_page}&page={page_number}&auth_token={token}'
    company_search_url = 'http://dev.markitondemand.com/Api/v2/Lookup/json?input='
    quote_url = 'http://dev.markitondemand.com/Api/v2/Quote/json?symbol='

    @classmethod
    def find_company(cls, name, page_number):
        if not isinstance(name, str):
            return dict(error='Error Invalid Input Type')
        # response = requests.get(cls.company_search_url + name)
        kwargs = dict(query=quote(name),database='YAHOO',per_page=25,page_number=page_number,token=os.environ['QUANDL_KEY'])
        
        url = cls.test_company_search.format(**kwargs)
        response = requests.get(url)

        if response.status_code == 200:
            page = response.json()
            if 'docs' not in page:
                results = dict(list=[])
            else:
                results = dict(
                    list=cls.some_function_to_clean_results(page['docs']),
                    start=page['start'],
                    per_page=page['per_page'],
                    total_count=page['total_count'],
                    current_page=page['current_page']
                )
            return results
        return dict(error='Request Error')

    @classmethod
    def find_quote(cls, symbol):
        if not isinstance(symbol, str):
            return dict(error='Error Invalid Input Type')
        response = requests.get(cls.quote_url + symbol)
        if response.status_code == 200:
            return response.json()
        return dict(error='Request Error')

    @staticmethod
    def some_function_to_clean_results(results):
        item_list = []
        for item in results:
            group = item['code'].split('_')
            if len(group) == 1:
                item['name'] = item['name'].rstrip(' -')
                item_list.append(item)
            elif len(group) == 2 and (group[0]=="FUND" or group[0]=="INDEX"):
                item_list.append(item)
        return item_list

    # http://finance.yahoo.com/q?s=APPL&ql=1
    # might become static method
    # @classmethod
    # def market_view(cls):

    # @classmethod
    # def market_news(cls,**kwargs):
        
    # @classmethod
    # def security_news(cls,**kwargs):