from django.db import models
from quandl.models import Company
from sentiment.models import Sentiment
# Create your models here.

class Article(models.Model):
    pass
    # yahoo id
    # yahoo link or web page link
    # slug line of title
    # models.ForeignKey(Sentiment)
    # models.ManyToManyField(Company)