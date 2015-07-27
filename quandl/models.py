import datetime
import os
from django.db import models
import requests

class Quandl:
    api_key = os.environ['QUANDL_KEY']
    base_url = 'https://www.quandl.com/api/v1/datasets/'
    format =  'json'
    db = 'GOOG'

    @classmethod
    def get_dataset(cls, exchange, symbol, start_date):
        # yahoo and google format
        code = "{}/{}_{}".format(cls.db,exchange,symbol)
        command = '{db_code}.{format}?auth_token={api_key}&trim_start={start}'.format(
            db_code=code,
            format=cls.format,
            api_key=cls.api_key,
            start=start_date
        )
        response = requests.get(cls.base_url + command)
        if response.status_code == 200:
            return response.json()
        return {'error': response.status_code}
        # Use other formats to get data
    # ----------------------------------------------------#
    #           DB        |         DB          |    DB   #
    # --------------------|---------------------|---------#
    #         YAHOO/      |        GOOG/        |  WIKI/  #
    # --------------------|---------------------|---------#
    #         Table       |        Table        |  Table  #
    # --------------------|---------------------|---------#
    # {EXCHANGE}_{TICKER} | {EXCHANGE}_{TICKER} | {TICKER}#
    # ----------------------------------------------------#