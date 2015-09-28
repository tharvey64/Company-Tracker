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
        # print("models.py line 19\n", text)
        data = text.split("\n")[:-1]
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
                        # This Whole Method Is Tempermental
                        # Check isDigit on all of these items being turned into int()
                        date_start = datetime.datetime.fromtimestamp(int(raw[i][1:]))
                        date_start += datetime.timedelta(minutes=int(data[6].split("=")[1]))
                        raw[i] = str(date_start)
            stage = dict(zip(key,raw))
            stage["date"]=stage["DATE"]
            stage["height"]=stage["CLOSE"]
            stage["radius"]=stage["VOLUME"]
            # stage["title"]=stage["CLOSE"]
            stage["title"]=stage["DATE"]

            processing.append(stage)
        return dict(error=None,prices=processing)

class Yahoo:
    # This Should not be 10d It needs to be flexible
    # see Attached file for other flexiblity issues
    url = 'http://chartapi.finance.yahoo.com/instrument/1.0/{TICKER}/chartdata;type=quote;range={DAYS}d/csv'
    
    @classmethod
    def get_intra_day_prices(cls, ticker, days=1):
        # print(cls.url.format(interval_seconds=interval,period_days=period,ticker=ticker)
        base = cls.url
        url = base.format(TICKER=ticker.upper(),DAYS=days)
        response = requests.get(url)
        return cls.process_csv(response.text, cls.clean_row, days)

    @staticmethod
    def process_csv(text, cleaner, days):
        # print(text)
        if len(text) < 100 or 'errorid' in text[60:90]:
            print("quandl/models.py 71\n", text)
            return dict(error=text, prices=None)

        data = text.split("\n")[:-1]
        gmtoffset = int(data[7].split(":")[1])
        csv_offset = 0 if days == 1 else int(days)
        keys = data[11+csv_offset].split(":")[1].split(",")
        ranges = data[12+csv_offset:17+csv_offset]
        # ranges not available in quandl
        # print("quandl/models.py 79\n", ranges)
        price_list = [cleaner(line.split(","), keys, gmtoffset) for line in data[17+csv_offset:]]
        
        if len(price_list):
            return dict(error=None, prices=price_list)
        else:
            return dict(error="No Intraday Data", prices=None)

    @staticmethod
    def clean_row(row_list, keys, gmtoffset):
        for idx in range(len(row_list)):
            if idx == 0:
                value = datetime.datetime.fromtimestamp(int(row_list[idx]))
                value += datetime.timedelta(seconds=gmtoffset)
                row_list[idx] = str(value)
            else:
                row_list[idx] = float(row_list[idx])
        row_dict = dict(zip(keys, row_list))
        row_dict["date"]=row_dict["Timestamp"]
        row_dict["height"]=row_dict["close"]
        row_dict["radius"]=row_dict["volume"]
        # row_dict["title"]=row_dict["CLOSE"]
        row_dict["title"]=row_dict["Timestamp"]
        return row_dict

# Refactor This
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
        # end_date = today less ten
        end_date = datetime.date.today()-datetime.timedelta(days=10)
        command = '{db_code}.{format}?auth_token={api_key}&trim_start={start}&end_date={end}'.format(
            db_code=code,
            format=cls.format,
            api_key=cls.api_key,
            start=start_date,
            end=str(end_date)
        )
        response = requests.get(cls.base_url + command)
        if response.status_code == 200:
            return cls.process_json(response.json(),symbol, cls.clean_row)
        return dict(error=response.status_code)
    
    @staticmethod
    def process_json(stock_info, symbol, cleaner):
        if 'data' not in stock_info:
            print("quandl/models.py 139\n",stock_info)
            return dict(error='Historical Data Not Found.', prices=None)
        elif not len(stock_info['data']):
            print("quandl/models.py 142\n",stock_info)
            return dict(error='Historical Data Not Found.', prices=None, symbol=symbol)
        else:
            # Yahoo Data Format
            if len(stock_info['data'][0]) < 7:
                print("_"*50)
                print("quandl/models.py 147\n", stock_info)
                print("_"*50)
                return dict(error="Data Format Error", prices=None)
            processed_data = [dict(date=day[0]+' 16:00:00', height=day[6], radius=day[5], title=day[0]) for day in stock_info['data']]

            return dict(error=None, prices=processed_data, symbol=symbol)

    @staticmethod
    def clean_row(row, keys):
        row_dict = dict(zip(row,keys))
        row_dict['height'] = row_dict['Adjusted Close'] 
        row_dict['date'] = row_dict['Date']
        row_dict['raduis'] = row_dict['Volume']
        row_dict['title'] = row_dict['Date'] 
        return(row_dict)  
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