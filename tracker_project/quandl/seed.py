import csv
from datetime import datetime
from django.db.utils import IntegrityError
from quandl.models import Company, StockPrice, Quandl

# OUT OF DATE
def seed_nasdaq_100(path_to_companies="quandl/nasdaq100.csv"):
    with open(path_to_companies) as companies:
        file_reader = csv.reader(companies, delimiter=',')
        # next(file_reader)
        for line in file_reader:
            Company.objects.create(
                name=line[2],
                symbol=line[0],
                exchange="NASDAQ"
            )
    return Company.objects.all()
    
def seed_stock_prices(path_to_codes="quandl/nasdaq100.csv"):
    with open(path_to_codes) as codes:
        file_reader = csv.reader(codes, delimiter=',')
        next(file_reader)
        for line in file_reader:
            company = Company.objects.filter(symbol=line[0])
            if len(company) == 1:
                code = line[1]
                prices = Quandl.get_dataset(code)

                if 'data' in prices:
                    for day in prices['data']:
                        date = datetime.strptime(day[0],'%Y-%m-%d').date()
                        if date.year < 2005:
                            break
                        elif date == date.today():
                            continue
                        try:
                            StockPrice.objects.create(    
                                open_price=day[1],
                                close_price=day[4], 
                                high_price=day[2],  
                                low_price=day[3], 
                                volume=day[5],
                                company=company[0],
                                created_at=date
                            )
                        except IntegrityError:
                            day = day[:1] + [item if item else 0.0 for item in day[1:]]
                            StockPrice.objects.create(    
                                open_price=day[1],
                                close_price=day[4], 
                                high_price=day[2],  
                                low_price=day[3], 
                                volume=day[5],
                                company=company[0],
                                created_at=date
                            )
    return StockPrice.objects.all()

seed_nasdaq_100()
seed_stock_prices()

