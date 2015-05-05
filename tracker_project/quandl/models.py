from django.db import models
import requests
from tracker_project.settings import QUANDL_KEY 
# Create your models here.

# Necessary?
class Date(models.Model):
    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()
    day = models.PositiveIntegerField()
    hour = models.PositiveIntegerField()
    minute = models.PositiveIntegerField()
    seconds = models.PositiveIntegerField()

class Company(models.Model):
    name = models.CharField(max_length=40)
    ticker = models.CharField(max_length=30)
    exchange = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)

class StockPrice(models.Model):
    open_price = models.DecimalField(decimal_places=2, max_digits=8)
    close_price = models.DecimalField(decimal_places=2, max_digits=8)
    high_price = models.DecimalField(decimal_places=2, max_digits=8) 
    low_price = models.DecimalField(decimal_places=2, max_digits=8)
    volume = models.DecimalField(decimal_places=2, max_digits=10)
    company = models.ForeignKey(Company)
    date = models.ForeignKey(Date)
    created_at = models.DateTimeField(auto_now_add=True)

class Quandl:
    api_key = QUANDL_KEY
    data_set = 'https://www.quandl.com/api/v1/datasets/'
    database_code = 'WIKI'
    table_code = 'AAPL'
    format =  'json'

    
    @classmethod
    def get_dataset(cls):
        url = 'https://www.quandl.com/api/v1/datasets/'
        response = requests.get(url + '{}/{}.{}?auth_token={}'.format(cls.database_code,cls.table_code,cls.format,cls.api_key))
        if response.status_code == 200:
            json = response.json()
            close_prices = []
            for day in json['data']:
                close_prices.append([day[0],day[11]])
            return {'close': close_prices[:50]}
        return {'error':'request failed'}

    # @classmethod    
    # def get_database_code(cls):


    # @classmethod    
    # def get_table_code(cls):
