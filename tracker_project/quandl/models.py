from django.db import models
import requests

# Create your models here.

class Quandl:
    data_set = 'https://www.quandl.com/api/v1/datasets/'
    database_code = 'WIKI'
    table_code = 'AAPL'
    format =  'json'
    
    @classmethod
    def get_dataset(cls):
        url = 'https://www.quandl.com/api/v1/datasets/'
        response = requests.get(url + '{}/{}.{}?auth_token={}'.format(cls.database_code,cls.table_code,cls.format,cls.quandl_api_key))
        if response.status_code == 200:
            json = response.json()
            close_prices = []
            for day in json['data']:
                close_prices.append([day[0],day[11]])
            return {'close': close_prices[:500]}
        return {'error':'request failed'}

    # @classmethod    
    # def get_database_code(cls):


    # @classmethod    
    # def get_table_code(cls):
