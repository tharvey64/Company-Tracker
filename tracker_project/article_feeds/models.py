from django.db import models
from quandl.models import Company
from sentiment.models import Sentiment
# Create your models here.

class Article(models.Model):
    pass
    # Needs pointer to Sentiment
    # Needs pointer to Company