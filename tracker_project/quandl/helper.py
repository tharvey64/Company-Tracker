import datetime
from quandl.models import StockPrice

def check_company(close):
    if not close: 
        return False
    return True

def check_date(close):
    today = datetime.datetime.today().date() 
    if (today - close[0].updated_at).days <= 4:
        if today.weekday() > 4 or today.weekday() == 0 or (today - close[0].updated_at).days < 2:
            return False
    return True

def date_format_one(date_string):
    return datetime.datetime.strptime(date_string,'%Y-%m-%d').date()

def price_list(prices, company):
    stock_prices = []
    for day in prices:
        date = date_format_one(day[0])
        stock_prices.append(
            StockPrice(    
                open_price=day[1] if day[1] else -1.0,
                close_price=day[4] if day[4] else -1.0, 
                high_price=day[2] if day[2] else -1.0,  
                low_price=day[3] if day[3] else -1.0, 
                volume=day[5] if day[5] else -1.0,
                company=company,
                created_at=date
            )
        )
    return stock_prices