from django.db import models
import requests
from tracker_project.settings import QUANDL_KEY

# Move Company to Markit
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

class LastPrice(models.Model):
    updated_at = models.DateField()
    company = models.ForeignKey(Company)

class Quandl:
    api_key = QUANDL_KEY
    base_url = 'https://www.quandl.com/api/v1/datasets/'
    format =  'json'
    # ----------------------------------------------------#
    #           DB        |         DB          |    DB   #
    # --------------------|---------------------|---------#
    #         YAHOO/      |        GOOG/        |  WIKI/  #
    # --------------------|---------------------|---------#
    #         Table       |        Table        |  Table  #
    # --------------------|---------------------|---------#
    # {EXCHANGE}_{TICKER} | {EXCHANGE}_{TICKER} | {TICKER}#
    # ----------------------------------------------------#
    
    @classmethod
    def get_dataset(cls, code, start_date):
        command = '{db_code}.{format}?auth_token={api_key}&trim_start={start}'.format(
            db_code=code,
            format=cls.format,
            api_key=cls.api_key,
            start=start_date
        )
        response = requests.get(cls.base_url + command)
        if response.status_code == 200:
            json = response.json()
            return {'data': json['data']}
        return {'error':'request failed'}