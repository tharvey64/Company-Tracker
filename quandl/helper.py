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

def stock_price_list(prices, company):
    stock_prices = []
    for day in prices:
        day[0] = date_format_one(day[0])
        stock_prices.append(stock(company, *day))
    return stock_prices

def stock(company, *args):
    return StockPrice(    
        open_price=args[1] if args[1] else -1.0,
        close_price=args[4] if args[4] else -1.0, 
        high_price=args[2] if args[2] else -1.0,  
        low_price=args[3] if args[3] else -1.0, 
        volume=args[5] if args[5] else -1.0,
        company=company,
        created_at=args[0]
    )