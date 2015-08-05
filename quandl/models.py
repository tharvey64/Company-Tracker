import datetime
import os
from django.db import models
import requests

class Google:
    url = 'http://www.google.com/finance/getprices?i={interval_seconds}&p={period_days}&f=d,o,h,l,c,v&df=cpct&q={ticker}'
    
    @classmethod
    def get_intra_day_prices(cls, interval, period, ticker):
        # print(cls.url.format(interval_seconds=interval,period_days=period,ticker=ticker)
        base = cls.url
        m = base.format(interval_seconds=interval,period_days=period,ticker=ticker.upper())
        response = requests.get(m)
        # IT Is in the text
        # NEEDS ERROR HANDLELING
        # Ugly untangling of csv
        data = response.text.split("\n")[:-1]

        key = data[4][8:].split(",")

        start = [float(value) if not value[0].isalpha() else int(value[1:]) for value in data[7].split(",")]
        # hacky time
        date_start = datetime.datetime.fromtimestamp(start[0])
        date_start -= datetime.timedelta(seconds=int(data[6][-3:])*60)
        start[0] = str(date_start)

        kswiss = dict(zip(key,start))
        kswiss["date"]=kswiss["DATE"]
        kswiss["height"]=kswiss["CLOSE"]
        kswiss["radius"]=kswiss["VOLUME"]
        kswiss["title"]=kswiss["CLOSE"]

        processing = [kswiss]
        for line in data[8:]:
            raw = line.split(",")
            for i in range(6):
                if i > 0:
                    raw[i]=float(raw[i])
                else:
                    raw[i]=str(date_start+datetime.timedelta(seconds=int(raw[i])*int(interval)))
            stage = dict(zip(key,raw))
            stage["date"]=stage["DATE"]
            stage["height"]=stage["CLOSE"]
            stage["radius"]=stage["VOLUME"]
            stage["title"]=stage["CLOSE"]
            processing.append(stage)
            # Keys need to be lower to match D3 Code
            # Hacky but possible
        # Honestly shocked this takes less than a second
        return processing

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