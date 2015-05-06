from .models import Company
import csv

def seed_nasdaq_100(path_to_companies="quandl/nasdaq100list.csv"):

    with open(path_to_companies) as companies:
        file_reader = csv.reader(companies, delimiter=',')
        # next(file_reader)
        for line in file_reader:
            Company.objects.create(
                name=line[1].lstrip(),
                symbol=line[0],
                exchange="NASDAQ"
            )
    return Company.objects.all()
    