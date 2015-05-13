from django.db import models
from quandl.models import Company
from sentiment.models import Sentiment
# Create your models here.

class Tweet(models.Model):
    text = models.CharField(max_length=140)
    tweet_id = models.BigIntegerField()
    favorites = models.IntegerField()
    tweet_date = models.DateTimeField()
    keyword = models.CharField(max_length=200)
    sentiment = models.ForeignKey(Sentiment)