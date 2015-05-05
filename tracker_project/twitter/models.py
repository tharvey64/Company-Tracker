from django.db import models
from quandl.models import Company
# Create your models here.
class Sentiment(models.Model):
    result = models.CharField(max_length=8)
    score = models.DecimalField(decimal_places=10,max_digits=11)
    company = models.ForeignKey(Company)
    created_at = models.DateField(auto_now_add=True)
