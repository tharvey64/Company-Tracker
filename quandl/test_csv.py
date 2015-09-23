import requests
import datetime

@staticmethod
def test_csv(text):
    data = text.split("\n")[:-1]
    if len(data) == 6:
        # prices should be empty list
        return dict(error='Intraday Data Not Found', prices=None)
    # print(data[:17])
    # offset = int(data[7].split(":")[1])
    keys = data[11].split(":")[1].split(",")
    # print(offset,keys) 
    price_list = [clean_row(line.split(","), keys) for line in data[17:]]
    return price_list
@staticmethod
def clean_row(row_list, keys):
    for idx in range(len(row_list)):
        if idx == 0:
            value = datetime.datetime.fromtimestamp(int(row_list[idx]))
            row_list[idx] = str(value)
        else:
            row_list[idx] = float(row_list[idx])
    row_dict = dict(zip(keys, row_list))
    
m = requests.get('http://chartapi.finance.yahoo.com/instrument/1.0/AAPL/chartdata;type=quote;range=1d/csv')
test_csv(m.text)