from django.db import models
import requests
from tracker_project.settings import QUANDL_KEY

class Company(models.Model):
    name = models.CharField(max_length=60)
    symbol = models.CharField(max_length=15,unique=True)
    exchange = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)

class StockPrice(models.Model):
    open_price = models.DecimalField(decimal_places=2, max_digits=8)
    close_price = models.DecimalField(decimal_places=2, max_digits=8)
    high_price = models.DecimalField(decimal_places=2, max_digits=8) 
    low_price = models.DecimalField(decimal_places=2, max_digits=8)
    volume = models.DecimalField(decimal_places=2, max_digits=12)
    company = models.ForeignKey(Company)
    created_at = models.DateField()

class Quandl:
    api_key = QUANDL_KEY
    data_set = 'https://www.quandl.com/api/v1/datasets/'
    code = 'WIKI/AAPL'
    format =  'json'

    
    @classmethod
    def get_dataset(cls, code):
        url = 'https://www.quandl.com/api/v1/datasets/{}.{}?auth_token={}'.format(code,cls.format,cls.api_key)
        response = requests.get(url)
        if response.status_code == 200:
            json = response.json()
            return {'data': json['data']}
        return {'error':'request failed'}

    # @classmethod    
    # def get_database_code(cls):


    # @classmethod    
    # def get_table_code(cls):
