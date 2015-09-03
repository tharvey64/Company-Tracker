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
        return cls.process_csv(response.text)

    @staticmethod
    def process_csv(text):
        data = text.split("\n")[:-1]
        # print(data)
        if len(data) == 6:
            # prices should be empty list
            return dict(error='Intraday Data Not Found', prices=None)
        
        interval = data[3].split("=")[1]
        key = data[4][8:].split(",")
        date_start = None
        processing = []
        for line in data[7:]:
            raw = line.split(",")
            for i in range(6):
                if i > 0:
                    raw[i]=float(raw[i])
                else:
                    if date_start:
                        time = date_start+datetime.timedelta(seconds=int(raw[i])*int(interval))
                        raw[i]=str(time)
                    else:
                        print(raw[i])
                        date_start = datetime.datetime.fromtimestamp(int(raw[i][1:]))
                        date_start -= datetime.timedelta(minutes=int(data[6][-3:]))
                        raw[i] = str(date_start)
            stage = dict(zip(key,raw))
            stage["date"]=stage["DATE"]
            stage["height"]=stage["CLOSE"]
            stage["radius"]=stage["VOLUME"]
            # stage["title"]=stage["CLOSE"]
            stage["title"]=stage["DATE"]

            processing.append(stage)
        return dict(error=None,prices=processing)

class Quandl:
    api_key = os.environ['QUANDL_KEY']
    base_url = 'https://www.quandl.com/api/v1/datasets/'
    format =  'json'

    @classmethod
    def get_dataset(cls, source_code, code, start_date):
        # yahoo and google format
        group = code.split('_')
        # Do This In The Model
        if len(group) == 1:
            symbol = group[0]
        elif len(group) == 2 and (group[0]=="FUND" or group[0]=="INDEX"):
            symbol = group[1]
        else:
            return JsonResponse(dict(error=group))
        code = "{}/{}".format(source_code,code)
        end_date = datetime.date.today()-datetime.timedelta(days=1)
        command = '{db_code}.{format}?auth_token={api_key}&trim_start={start}&end_date={end}'.format(
            db_code=code,
            format=cls.format,
            api_key=cls.api_key,
            start=start_date,
            end=str(end_date)
        )
        response = requests.get(cls.base_url + command)
        if response.status_code == 200:
            return cls.process_json(response.json(),symbol)
        return dict(error=response.status_code)
    
    @staticmethod
    def process_json(stock_info,symbol):
        if 'data' in stock_info:
            # Yahoo Data Format
            processed_data = [dict(date=day[0]+' 16:00:00', height=day[6], radius=day[5], title=day[0]) for day in stock_info['data']]
            return dict(error=None,prices=processed_data,symbol=symbol)
        else:
            return dict(error='Historical Data Not Found.',prices=None)
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
    # GOOG
    # ["Date","Open","High","Low","Close","Volume"]
    # WIKI
    # ["Date","Open","High","Low","Close","Volume","Ex-Dividend","Split Ratio","Adj. Open","Adj. High","Adj. Low","Adj. Close","Adj. Volume"]
    # YAHOO
    # ["Date","Open","High","Low","Close","Volume","Adjusted Close"]


