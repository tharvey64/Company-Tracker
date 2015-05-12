from django.db import models
from quandl.models import Company
from sentiment.models import Sentiment
# Create your models here.

class Tweet(models.Model):
    pass
    # Needs pointer to Sentiment
    # Needs pointer to Company